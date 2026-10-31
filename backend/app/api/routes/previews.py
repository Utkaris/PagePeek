import logging
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse, Response
from playwright.async_api import Error as PlaywrightError, TimeoutError as PlaywrightTimeoutError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.models.preview import URLPreview
from app.models.user import User
from app.schemas.preview import PreviewCreate, PreviewResponse
from app.services.screenshot_service import capture_screenshot
from app.services.url_validator import validate_url

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/previews",
    tags=["URL Previews"],
)


@router.post(
    "/",
    response_model=PreviewResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_preview(
    preview_data: PreviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    url = await validate_url(str(preview_data.url))
    screenshot_path = None

    try:
        screenshot_path = await capture_screenshot(
            url=url,
            user_id=current_user.id,
        )

        preview = URLPreview(
            user_id=current_user.id,
            url=url,
            screenshot_path=screenshot_path,
        )

        db.add(preview)
        await db.commit()
        await db.refresh(preview)

        return PreviewResponse(
            id=preview.id,
            url=preview.url,
            screenshot_url=f"/api/previews/{preview.id}/image",
            created_at=preview.created_at,
        )

    except (PlaywrightTimeoutError, PlaywrightError) as err:
        await db.rollback()
        if screenshot_path:
            file_path = Path(settings.SCREENSHOT_DIR) / screenshot_path
            file_path.unlink(missing_ok=True)

        logger.warning(f"Screenshot capture failed for {url}: {err}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The website could not be reached, took too long to respond, or blocked automated access.",
        )

    except HTTPException:
        await db.rollback()
        if screenshot_path:
            file_path = Path(settings.SCREENSHOT_DIR) / screenshot_path
            file_path.unlink(missing_ok=True)
        raise

    except Exception as err:
        await db.rollback()
        if screenshot_path:
            file_path = Path(settings.SCREENSHOT_DIR) / screenshot_path
            file_path.unlink(missing_ok=True)

        logger.error(f"Unexpected error creating preview for {url}: {err}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to generate website preview.",
        )


@router.get(
    "/",
    response_model=list[PreviewResponse],
)
async def list_previews(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(URLPreview)
        .where(URLPreview.user_id == current_user.id)
        .order_by(URLPreview.created_at.desc())
    )

    previews = result.scalars().all()

    return [
        PreviewResponse(
            id=preview.id,
            url=preview.url,
            screenshot_url=f"/api/previews/{preview.id}/image",
            created_at=preview.created_at,
        )
        for preview in previews
    ]


@router.get(
    "/{preview_id}",
    response_model=PreviewResponse,
)
async def get_preview(
    preview_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(URLPreview).where(
            URLPreview.id == preview_id,
            URLPreview.user_id == current_user.id,
        )
    )

    preview = result.scalar_one_or_none()

    if preview is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Preview not found.",
        )

    return PreviewResponse(
        id=preview.id,
        url=preview.url,
        screenshot_url=f"/api/previews/{preview.id}/image",
        created_at=preview.created_at,
    )


@router.get("/{preview_id}/image")
async def get_preview_image(
    preview_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(URLPreview).where(
            URLPreview.id == preview_id,
            URLPreview.user_id == current_user.id,
        )
    )

    preview = result.scalar_one_or_none()

    if preview is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Preview not found.",
        )

    base_dir = Path(settings.SCREENSHOT_DIR).resolve()
    image_path = (base_dir / preview.screenshot_path).resolve()

    if not image_path.is_relative_to(base_dir):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Screenshot not found.",
        )

    if not image_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Screenshot file does not exist.",
        )

    return FileResponse(
        path=image_path,
        media_type="image/png",
        filename=f"preview-{preview.id}.png",
    )


@router.delete("/{preview_id}", status_code=status.HTTP_200_OK)
async def delete_preview(
    preview_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(URLPreview).where(
            URLPreview.id == preview_id,
            URLPreview.user_id == current_user.id,
        )
    )

    preview = result.scalar_one_or_none()

    if preview is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Preview not found.",
        )

    base_dir = Path(settings.SCREENSHOT_DIR).resolve()
    file_path = (base_dir / preview.screenshot_path).resolve()
    if file_path.is_relative_to(base_dir):
        file_path.unlink(missing_ok=True)

    await db.delete(preview)
    await db.commit()

    return {"message": "Preview deleted successfully."}
