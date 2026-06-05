import "./index.css";
import { Composition } from "remotion";
import { YachtmaxPromo } from "./YachtmaxPromo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="YachtmaxPromo"
        component={YachtmaxPromo}
        durationInFrames={300} // 10 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
