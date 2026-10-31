from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    String,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class URLPreview(Base):
    __tablename__ = "url_previews"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    url: Mapped[str] = mapped_column(
        String(2048),
        nullable=False,
    )

    screenshot_path: Mapped[str] = mapped_column(
        String(512),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship(
        back_populates="previews",
    )

    __table_args__ = (
        Index("ix_preview_user_created", "user_id", "created_at"),
    )