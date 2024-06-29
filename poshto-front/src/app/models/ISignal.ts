import {SignalType} from "./SignalType";

export interface ISignal {
    type: SignalType;
    sdp?: RTCSessionDescription;
    candidate?: RTCIceCandidate;
}