from app.schemas.map2d import BoundaryDetectRequest, BoundaryDetectResponse, Map2DPoint


def detect_boundary_fallback(payload: BoundaryDetectRequest) -> BoundaryDetectResponse:
    # FastAPI foundation endpoint. The production version should use cv2 contour
    # detection here; this fallback keeps frontend migration unblocked.
    inset_x = payload.plotWidth * 0.04
    inset_y = payload.plotLength * 0.04
    polygon = [
        Map2DPoint(x=inset_x, y=inset_y),
        Map2DPoint(x=payload.plotWidth - inset_x, y=inset_y),
        Map2DPoint(x=payload.plotWidth - inset_x, y=payload.plotLength - inset_y),
        Map2DPoint(x=inset_x, y=payload.plotLength - inset_y),
    ]
    return BoundaryDetectResponse(success=True, polygon=polygon, confidence=0.55, source="fastapi_fallback")

