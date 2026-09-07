// Photo 10: frame the deity's face, not the center of the wider altar.
export const HOME_TEMPLE_PHOTO = {
  width: 994,
  height: 768,
  focalX: 0.525,
} as const;

export function getHomeTempleFraming(viewportWidth: number) {
  const viewportHeight = Math.min(viewportWidth * 1.06, 520);
  const scale = Math.max(
    viewportWidth / HOME_TEMPLE_PHOTO.width,
    viewportHeight / HOME_TEMPLE_PHOTO.height,
  );
  const width = HOME_TEMPLE_PHOTO.width * scale;
  const height = HOME_TEMPLE_PHOTO.height * scale;
  const centeredLeft = viewportWidth / 2 - width * HOME_TEMPLE_PHOTO.focalX;

  return {
    viewportHeight,
    image: {
      width,
      height,
      // Never expose an empty edge when a wider tablet needs less cropping.
      left: Math.min(0, Math.max(viewportWidth - width, centeredLeft)),
      top: (viewportHeight - height) / 2,
    },
  };
}
