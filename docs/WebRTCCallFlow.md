## Note: this document is outdated as the flow has changed to trickle ICE, i.e. not waiting for all ICE candidates to gather before sending them over or making the offer

## Outbound Call

- View is wired with `MAKE_OUTBOUND_VIDEO_CALL_OFFER` action (from `ChatRedux.js`) with `identityName`, `contactEmail`, `contactDisplayName`, `audioOnly`
- These values are set on redux store and video call camera is muted based on `audioOnly`
- `src/Sagas/index.js` listens for `MAKE_OUTBOUND_VIDEO_CALL_OFFER` and calls `makeOutboundVideoCallOffer`


### Control to `makeOutboundVideoCallOffer` (from line 5) –

- Transitions to video screen; checks permission; checks for chat API and waits until ready
- Creates a local call UUID;  sets values for audioOnly, cold launch, incoming state, identity email, contact email values on redux
- For iOS, check if audio session (`didActivateAudioSession` event from `RNCallKit`) has already been fired once;  activate it if not
- Fire `setupWebRTCForOutbound` without passing stream (see line 18)
- If above setup fails then fire `REJECT_VIDEO_CALL` action
- Spawn `listenAndToggleSpeaker`


### Control to `setupWebRTCForOutbound` (from line 13) – 

- Description: Setup peer with `setupWebRTC` passing `processOutboundCall` and without passing stream (see line 26);  get peer object in return
- Once the peer is setup, create offer;  prioritise H264 on SDP for better video performance
- Set local description with offer
- Return true if all is good


### Control to `setupWebRTC` (from from 20) –
- Description: Create peer object;  starts local ice candidate gathering; returns peer object
- Call `getLocalMedia` to get device camera/mic info
- Call `initializeRTCPeerConnection` to create peer (waits until complete)
    - Description: Creates peer object with ice server configuration;  also starts listening for ice candidates immediately
    - `const peer = new WebRTCLib.RTCPeerConnection(iceConfig)`
    - `iceConfig` contains configuration for ice servers based on udp/tcp perference
    - Spawn `gatherIceCandidates` with peer - 
        - listen on `peer.onicecandidate` until `!data || !data.candidate || peer.iceGatheringState === 'complete'`
        - parse candidate;  candidates of 3 types - `host`, `srflx` & `host`
        - filter based on whether `host` candidates are needed or not (`host` candidates are useful during development/testing)
        - save these candidates on redux store
    - `return peer`
- Spawn `processOutboundCall` with peer (background)
    - Description: Waits for local ice candidates, sends final outbound call payload to `/webrtc/call`;  handles anwser/reject/timeout;  adds remote description and remote ice candidates on peer
    - Call `getSavedCandidates`; check local `iceGatherState` until it equals `complete` or 60 seconds timeout, whichever is sooner;  then returns `iceCandidates` (control is blocked here upto 60 seconds) (note: on line 34, we are listening for ice candidates in parallel and checking for results here)
    - End video call if there are no candidates
    - At this point, we have `offer`/`localDescription` itself and candidates, necessary to start the call
    - Send payload with required data to `/webrtc/call` endpoint on chatd and wait until response
    - If `response.status` is true, then store `response.call_id` on redux; else callee is unreachable, so end the call
    - Create a race for call answer or reject or timeout
    - If answered
        - create answer SDP with `new WebRTCLib.RTCSessionDescription(parsed.answer)`
        - set remote description with this SDP on peer
        - `parsed.candidates.map(c => peer.addIceCandidate(new WebRTCLib.RTCIceCandidate(c)))`
        - wait until all the ice candidates have been added
    - If rejected or timedout
        - `peer.close()`
        - end call
- Spawn `listenForIceConnectionStateChangeChannel` with peer (background)
    - Once the call is accepted, this helps listen for ice connection state and mark the start of call if state is `completed`
    - listens on `peer.oniceconnectionstatechange`
    - end call if state is `closed` or `disconnected` or `failed`
    - call begins if state is `completed`
    - Note: ice connection has been established between clients and call has officially started
- Spawn `listenForRemoteStream` with peer (background)
    - listen for remote stream with `peer.onaddstream`
    - create url for stream and save it on redux store
    - Note: now we have remote stream
- Create stream with `getUserMedia`/`getNativeUserMedia`
    - blocks for several seconds
    - note: since the above sagas are spawned in the background, this is called right after peer object is created
    - note: can potentially delay the ICE gathering since it blocks the main thread
- Disable video track on stream if it is audio only call
- Add this stream to peer with `peer.addStream(stream)` and set local feed URL on redux store
- Spawn camera/mic toggle sagas - `listenAndToggleCamera`, `listenAndToggleMic`
- Spawn `cleanupLocalStreamOnEnd` for cleanup


----


## Inbound Call

- If `WEBRTC_OFFER` is received over chatd, check if duplicated call_id;  dispatch `INBOUND_VIDEO_CALL_OFFER_RECEIVED` if not a dup call
- `INBOUND_VIDEO_CALL_OFFER_RECEIVED` is also dispatched if push notifications are received for inbound calls
- `inboundVideoCallOfferReceived` saga is called with call data and `isColdLaunch`
    - checks if phone is already busy on a call
    - checks if call is expired
    - checks time between call initiation and current time;  times out if difference is huge (3 minutes)
- Call `showPlatformInboundCallUI` saga to render inbound call UI;  blocks until response from UI
    - call times out if user doesn't picks up
    - if answered, announce answer over chatd to endpoint `/webrtc/announce_answer`
    - call `registerInboundVideoCallOffer` to update redux store with call information
    - if `sdp_offer` is not present on received `data` payload, fetch it from chatd with `call_id`
    - hide inbound call UI; check mic/camera permissions
    - Call `setupWebRTCForInbound` without stream;  reject call if setup fails (**IMPORTANT**)
    - Call `listenAndToggleSpeaker`


### Control to `setupWebRTCForInbound`

- Setup peer object with `setupWebRTC` without passing stream
    - Same as `setupWebRTC` section on line 26;  except `processOutboundCall` spawn
- Parse the offer, create sdp object with `new WebRTCLib.RTCSessionDescription(parsed.offer)`
- Set remote description on peer object
- Create sdp answer from peer object (`peer.createAnswer`);  prioritise H264 on sdp
- Set this answer as local description on peer object
- Immediately add remote ice candidates on peer - `parsed.candidates.map(c => peer.addIceCandidate(new WebRTCLib.RTCIceCandidate(c)))`
- Wait until all the ice candidates have been added
- Spawn `processInboundCall` with peer object, `call_id` and answer
    - Call `getSavedCandidates`; check local `iceGatherState` until it equals `complete` or 60 seconds timeout, whichever is sooner;  then returns `iceCandidates` (control is blocked here upto 60 seconds)
    - If socket is down, wait for 60s before timing out call on receiving ends
    - Send answer to `/webrtc/answer`
    - If `response.status`, then store `response.call_id` on redux; else call has failed, so end it
