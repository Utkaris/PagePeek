from datetime import datetime

from pydantic import BaseModel, ConfigDict, HttpUrl


class PreviewCreate(BaseModel):
    url: HttpUrl


class PreviewResponse(BaseModel):
    id: int
    url: str
    screenshot_url: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)