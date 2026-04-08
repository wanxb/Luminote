export function SummerShadowBackground() {
  return (
    <>
      <div className="summer-shadow-stage" aria-hidden="true">
        <video className="summer-shadow-video-single" autoPlay loop muted playsInline preload="auto">
          <source src="/leaves.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="summer-wall-tint" aria-hidden="true" />
    </>
  );
}