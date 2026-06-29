import { useEffect, useState } from 'react';
import type { LottieComponentProps } from 'lottie-react';
import Lottie from 'lottie-react';

interface LottieWrapperProps extends Omit<LottieComponentProps, 'animationData'> {
  animationUrl?: string;
  animationData?: unknown;
}

const LottieWrapper = ({ animationUrl, animationData, ...props }: LottieWrapperProps) => {
  const [data, setData] = useState<unknown>(animationData);

  useEffect(() => {
    if (animationUrl && !animationData) {
      fetch(animationUrl)
        .then((res) => res.json())
        .then((json) => setData(json))
        .catch((err) => console.error('Error loading Lottie animation:', err));
    }
  }, [animationUrl, animationData]);

  if (!data) return <div className="animate-pulse bg-stone-200/50 rounded-2xl w-full h-full flex items-center justify-center min-h-[50px] min-w-[50px]" />;

  return <Lottie animationData={data} {...props} />;
};

export default LottieWrapper;
