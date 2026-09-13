/** Ambient code-art behind the whole story: one soft lamp glow that slowly
    breathes, over a faint dot grid that fades out downward. Theme-aware via
    tokens, pure CSS, no raster. */
export function StoryBackdrop() {
  return (
    <div aria-hidden="true" className="story-bg pointer-events-none fixed inset-0 -z-10">
      <div className="story-grid absolute inset-0" />
      <div className="story-lamp absolute inset-0" />
    </div>
  );
}
