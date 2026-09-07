// Photo 10: frame the deity's face, not the center of the wider altar.
export const HOME_TEMPLE_PHOTO = {
  width: 1024,
  height: 682,
  focalX: 0.55,
  focalY: 0.34,
  zoom: 1.24,
  targetY: 0.5,
} as const;

export function getHomeTempleFraming(viewportWidth: number) {
  const viewportHeight = Math.min(viewportWidth * 1.06, 520);
  const coverScale = Math.max(
    viewportWidth / HOME_TEMPLE_PHOTO.width,
    viewportHeight / HOME_TEMPLE_PHOTO.height,
  );
  const scale = coverScale * HOME_TEMPLE_PHOTO.zoom;
  const width = HOME_TEMPLE_PHOTO.width * scale;
  const height = HOME_TEMPLE_PHOTO.height * scale;
  const centeredLeft = viewportWidth / 2 - width * HOME_TEMPLE_PHOTO.focalX;
  const centeredTop =
    viewportHeight * HOME_TEMPLE_PHOTO.targetY -
    height * HOME_TEMPLE_PHOTO.focalY;
  const minTop = viewportHeight - height;

  return {
    viewportHeight,
    image: {
      width,
      height,
      // Never expose an empty edge when a wider tablet needs less cropping.
      left: Math.min(0, Math.max(viewportWidth - width, centeredLeft)),
      top: Math.min(0, Math.max(minTop, centeredTop)),
    },
  };
}
