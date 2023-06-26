import { useEffect, useState } from 'react';
import { Image } from 'react-native';
import type { Frame } from '../Frame';

declare global {
  type TensorflowPlugin = (frame: Frame) => Float32Array[];
  /**
   * Loads the Model into memory. Path is fetchable resource, e.g.:
   * http://192.168.8.110:8081/assets/assets/model.tflite?platform=ios&hash=32e9958c83e5db7d0d693633a9f0b175
   */
  const loadTensorflowModel: (path: string, delegate?: 'metal' | 'core-ml') => Promise<TensorflowPlugin>;
}

type Require = ReturnType<typeof require>;

export type TensorflowPlugin =
  | {
      run: (frame: Frame) => Float32Array[];
      status: 'loaded';
    }
  | {
      run: undefined;
      status: 'loading';
    }
  | {
      run: undefined;
      status: 'error';
    };

export function useTensorflowModel(model: Require): TensorflowPlugin {
  const [state, setState] = useState<TensorflowPlugin>({ status: 'loading', run: undefined });

  useEffect(() => {
    const load = async (): Promise<void> => {
      try {
        setState({ status: 'loading', run: undefined });
        const source = Image.resolveAssetSource(model);
        const func = await loadTensorflowModel(source.uri);
        setState({ status: 'loaded', run: func });
      } catch (e) {
        setState({ status: 'error', run: undefined });
      }
    };
    load();
  }, [model]);

  return state;
}
