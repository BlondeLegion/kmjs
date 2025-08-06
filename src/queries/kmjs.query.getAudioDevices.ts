//FILE: src/queries/kmjs.query.getAudioDevices.ts

/**
 * @file kmjs.query.getAudioDevices.ts
 * @module kmjs.query
 * @description Enumerates the current Core Audio routing devices (input, output, effects).
 */
import { runVirtualMacro } from "../kmjs.runVirtualMacro";
import { KM_TOKENS } from "../tokens/km.tokens";

export interface AudioDevices {
  input: { name: string; uid: string };
  output: { name: string; uid: string };
  effects: { name: string; uid: string };
}

export function getAudioDevices(): AudioDevices {
  const d = "::KMJS_DELIMITER::";
  const tokenStr = [
    KM_TOKENS.CurrentAudioInputDevice,
    KM_TOKENS.CurrentAudioInputDeviceUID,
    KM_TOKENS.CurrentAudioOutputDevice,
    KM_TOKENS.CurrentAudioOutputDeviceUID,
    KM_TOKENS.CurrentAudioSoundEffectsDevice,
    KM_TOKENS.CurrentAudioSoundEffectsDeviceUID,
  ].join(d);
  const raw = runVirtualMacro(
    [],
    "query:getAudioDevices",
    tokenStr,
    true,
  ) as string;
  const [inName, inUID, outName, outUID, fxName, fxUID] = raw.split(d);
  return {
    input: { name: inName, uid: inUID },
    output: { name: outName, uid: outUID },
    effects: { name: fxName, uid: fxUID },
  };
}

if (require.main === module) {
  require("./kmjs.query.cli");
}
