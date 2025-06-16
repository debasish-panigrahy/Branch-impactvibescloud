import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  CContainer,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CButton,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilMenu } from '@coreui/icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPhone, faMicrophone, faPhoneSlash } from '@fortawesome/free-solid-svg-icons'
import Swal from 'sweetalert2'
import { AppHeaderDropdown } from './header/index'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import JsSIP from 'jssip'

function AppHeader() {
  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.changeState.sidebarShow) // ✅ updated
  const headerRef = useRef(null)

  const [isDialerOpen, setIsDialerOpen] = useState(false)
  const [isMicEnabled, setIsMicEnabled] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isCallActive, setIsCallActive] = useState(false)
  const [callStatus, setCallStatus] = useState('Idle')
  const [isMuted, setIsMuted] = useState(false)
  const [isOnHold, setIsOnHold] = useState(false)
  const [session, setSession] = useState(null)
  const [callTimer, setCallTimer] = useState(0)
  const [timerInterval, setTimerInterval] = useState(null)

  const [incomingSession, setIncomingSession] = useState(null)
  const [incomingCaller, setIncomingCaller] = useState('')
  const [isIncomingModalOpen, setIsIncomingModalOpen] = useState(false)

  const [callDirection, setCallDirection] = useState(null) // 'incoming' | 'outgoing' | null

  const uaRef = useRef(null)
  const sessionRef = useRef(null)
  const remoteAudioRef = useRef(null)
  const ringtoneRef = useRef({ pause: () => {}, currentTime: 0 }) // Dummy for now

  const handleDialerClick = () => {
    if (!isMicEnabled) {
      // Show microphone modal (do nothing, since it's already rendered when !isMicEnabled)
      setIsDialerOpen(false)
    } else {
      setIsDialerOpen(true)
    }
  }

  const handleEnableMicrophone = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setIsMicEnabled(true)
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Microphone Access Required',
        text: 'Please allow microphone access to use the dialer',
      })
    }
  }

  // --- Call logic ---
  const handleCall = (calleeNumber) => {
    const sipDetails = JSON.parse(localStorage.getItem('sipDetails') || '{}')
    const { sipUsername, sipPassword, sipServer } = sipDetails

    if (!sipUsername || !sipPassword || !sipServer) {
      Swal.fire('Error', 'SIP credentials not found. Please register SIP in your profile.', 'error')
      return
    }

    // Show modal and status immediately
    setCallDirection('outgoing')
    setCallStatus("Calling...")
    setIsCallActive(true)
    setIsDialerOpen(true)

    // Create JsSIP UA if not already created
    if (!uaRef.current) {
      const socket = new JsSIP.WebSocketInterface(`ws://${sipServer}`)
      const configuration = {
        sockets: [socket],
        uri: `sip:${sipUsername}@${sipServer}`,
        password: sipPassword,
        session_timers: false,
        register_expires: 30,
        user_agent: 'My SIP Client',
      }
      uaRef.current = new JsSIP.UA(configuration)
      uaRef.current.start()
    }

    try {
      const options = {
        mediaConstraints: { audio: true, video: false },
        rtcOfferConstraints: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: false
        },
        eventHandlers: {
          progress: () => setCallStatus("Ringing..."),
          confirmed: () => setCallStatus("Connected"),
          ended: () => {
            setCallStatus("Call Ended")
            setIsCallActive(false)
            setCallDirection(null)
            sessionRef.current = null
            setSession(null)
          },
          failed: (e) => {
            setCallStatus("Call Failed: " + e.cause)
            setIsCallActive(false)
            setCallDirection(null)
            sessionRef.current = null
            setSession(null)
          },
          peerconnection: (e) => {
            const pc = e.peerconnection
            pc.ontrack = (event) => {
              if (remoteAudioRef.current) {
                remoteAudioRef.current.srcObject = event.streams[0]
                remoteAudioRef.current.play().catch(err => 
                  console.error("Error playing remote audio:", err)
                )
              }
            }
          }
        },
        pcConfig: {
          iceServers: [
            { urls: ['stun:stun.l.google.com:19302'] }
          ]
        }
      }

      const newSession = uaRef.current.call(`sip:${calleeNumber}@${sipServer}`, options)
      setSession(newSession)
      sessionRef.current = newSession
    } catch (error) {
      setCallStatus("Failed")
      setIsCallActive(false)
      setCallDirection(null)
    }
  }

  const toggleMute = () => {
    if (sessionRef.current) {
      if (isMuted) sessionRef.current.unmute();
      else sessionRef.current.mute();
      setIsMuted(!isMuted);
    }
  };

  const toggleHold = () => {
    if (sessionRef.current) {
      if (isOnHold) sessionRef.current.unhold();
      else sessionRef.current.hold();
      setIsOnHold(!isOnHold);
    }
  };

  const handleDTMF = (digit) => {
    if (sessionRef.current && sessionRef.current.isEstablished()) {
      sessionRef.current.sendDTMF(digit);
    }
  };

  const handleEndCall = () => {
    if (sessionRef.current) {
      sessionRef.current.terminate();
      setCallStatus("Idle");
      setIsCallActive(false);
      setCallDirection(null);
      sessionRef.current = null;
      setSession(null);
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    }
  };

  // Start/stop timer when call connects/ends
  useEffect(() => {
    if (callStatus === "Connected") {
      if (!timerInterval) {
        const interval = setInterval(() => setCallTimer(t => t + 1), 1000)
        setTimerInterval(interval)
      }
    } else {
      if (timerInterval) {
        clearInterval(timerInterval)
        setTimerInterval(null)
        setCallTimer(0)
      }
    }
    // eslint-disable-next-line
  }, [callStatus])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        headerRef.current.classList.toggle('shadow-sm', window.scrollY > 0)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Only attach once
    if (!uaRef.current) {
      const sipDetails = JSON.parse(localStorage.getItem('sipDetails') || '{}')
      const { sipUsername, sipPassword, sipServer } = sipDetails

      const socket = new JsSIP.WebSocketInterface(`ws://${sipServer}`)
      const configuration = {
        sockets: [socket],
        uri: `sip:${sipUsername}@${sipServer}`,
        password: sipPassword,
        session_timers: false,
        register_expires: 30,
        user_agent: 'My SIP Client',
      }
      uaRef.current = new JsSIP.UA(configuration)
      uaRef.current.start()
    }

    if (uaRef.current) {
      uaRef.current.on('newRTCSession', (data) => {
        const { originator, session } = data
        if (originator === 'remote') {
          setIncomingSession(session)
          sessionRef.current = session // <--- store in ref for controls
          setIncomingCaller(session.remote_identity.uri.user)
          setIsIncomingModalOpen(true)
          setCallDirection('incoming')

          // Attach event handlers for media and status
          attachSessionHandlers(session)
        }
      })
    }
    // eslint-disable-next-line
  }, [])

  const handleAnswer = async () => {
    const session = sessionRef.current || incomingSession;
    if (!session) return;

    setIsIncomingModalOpen(false);
    setCallStatus("Connecting...");
    setIsCallActive(true);
    setIsDialerOpen(true);
    setPhoneNumber(incomingCaller);
    setCallDirection('incoming');

    // Ensure mic
    if (!isMicEnabled) {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsMicEnabled(true);
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Microphone Access Required',
          text: 'Please allow microphone access to answer the call',
        });
        return;
      }
    }

    // Answer the call
    try {
      session.answer({
        mediaConstraints: { audio: true, video: false },
        rtcOfferConstraints: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: false
        },
        pcConfig: {
          iceServers: [
            { urls: ['stun:stun.l.google.com:19302'] }
          ]
        }
      });
      attachSessionHandlers(session); // Attach handlers if not already
      setSession(session);
    } catch (err) {
      Swal.fire('Error', 'Call cannot be answered: ' + err.message, 'error');
    }
  }

  const handleReject = () => {
    if (incomingSession) {
      incomingSession.terminate()
      setIncomingSession(null)
      setIsIncomingModalOpen(false)
    }
  }

  const attachSessionHandlers = (session) => {
    session.on("peerconnection", (e) => {
      const pc = e.peerconnection;
      pc.ontrack = (event) => {
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = event.streams[0];
          remoteAudioRef.current.play().catch(err => 
            console.error("Error playing remote audio:", err)
          );
        }
      };
    });

    session.on("confirmed", () => setCallStatus("Connected"));
    session.on("accepted", () => setCallStatus("Connected"));
    session.on("progress", () => setCallStatus("Ringing..."));
    session.on("ended", () => {
      setCallStatus("Idle");
      setIsCallActive(false);
      setCallDirection(null);
      sessionRef.current = null;
      setSession(null);
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    });
    session.on("failed", (e) => {
      setCallStatus("Call Failed: " + e.cause);
      setIsCallActive(false);
      setCallDirection(null);
      sessionRef.current = null;
      setSession(null);
      if (remoteAudioRef.current) remoteAudioRef.current.srcObject = null;
    });
  };

  return (
    <CHeader position="sticky" className="mb-4 bg-light border-bottom" ref={headerRef}>
      <CContainer fluid className="px-4">
        <CHeaderToggler
          className="ps-1"
          onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
        >
          <CIcon icon={cilMenu} size="lg" />
        </CHeaderToggler>

        <div className="d-flex align-items-center">
          <span className="h3 mb-0 ms-3 text-dark">Agent</span>
        </div>

        <div className="ms-auto d-flex align-items-center">
          <div 
            className="d-flex align-items-center me-4 px-3 py-2 bg-light rounded-2 hover:bg-primary-subtle cursor-pointer"
            onClick={handleDialerClick}
            role="button"
          >
            <FontAwesomeIcon
              icon={faPhone}
              className="text-primary me-2"
              style={{ fontSize: '1.5rem' }}
            />
            <span className="text-dark fw-semibold fs-5">Dialer</span>
          </div>
          
          {/* Microphone Access Modal */}
          {!isMicEnabled && (
            <CModal
              visible={!isMicEnabled}
              onClose={() => {}}
              size="sm"
              alignment="center"
              className="dialer-modal"
              backdrop="static"
            >
              <CModalHeader className="border-0 bg-transparent">
                <CModalTitle className="text-center w-100">
                  <FontAwesomeIcon icon={faMicrophone} className="text-primary me-2" />
                  Microphone Access Required
                </CModalTitle>
              </CModalHeader>
              <CModalBody>
                <div className="text-center p-4">
                  <FontAwesomeIcon 
                    icon={faMicrophone} 
                    className="text-primary mb-3"
                    style={{ fontSize: '3rem' }}
                  />
                  <h4 className="mb-3">Microphone Access Required</h4>
                  <p className="text-muted mb-4">To make and receive calls, we need access to your microphone</p>
                  <CButton 
                    color="primary" 
                    size="lg"
                    className="px-4 py-2"
                    onClick={handleEnableMicrophone}
                  >
                    <FontAwesomeIcon icon={faMicrophone} className="me-2" />
                    Enable Microphone
                  </CButton>
                </div>
              </CModalBody>
            </CModal>
          )}

          {/* Dialer/Call Modal */}
          {isDialerOpen && isMicEnabled && (
            <CModal 
              visible={isDialerOpen} 
              onClose={() => !isCallActive && setIsDialerOpen(false)} 
              size="sm"
              alignment="center"
              className="dialer-modal"
              backdrop={isCallActive ? 'static' : true}
            >
              <CModalHeader closeButton={!isCallActive} className="border-0 bg-transparent">
                <CModalTitle className="text-center w-100">
                  <FontAwesomeIcon icon={faPhone} className="text-primary me-2" />
                  {isCallActive ? 'Ongoing Call' : 'Phone Dialer'}
                </CModalTitle>
              </CModalHeader>
              <CModalBody>
                <div className="text-center">
                  {!isMicEnabled ? (
                    <div className="text-center p-4">
                      <FontAwesomeIcon 
                        icon={faMicrophone} 
                        className="text-primary mb-3"
                        style={{ fontSize: '3rem' }}
                      />
                      <h4 className="mb-3">Microphone Access Required</h4>
                      <p className="text-muted mb-4">To make and receive calls, we need access to your microphone</p>
                      <CButton 
                        color="primary" 
                        size="lg"
                        className="px-4 py-2"
                        onClick={handleEnableMicrophone}
                      >
                        <FontAwesomeIcon icon={faMicrophone} className="me-2" />
                        Enable Microphone
                      </CButton>
                    </div>
                  ) : isCallActive && (
                    <div className="call-active-screen p-4">
                      <div className="caller-info mb-4">
                        <div className="caller-avatar mb-3">
                          <FontAwesomeIcon 
                            icon={faPhone} 
                            className="text-white"
                            style={{ fontSize: '2rem' }}
                          />
                        </div>
                        <h4 className="mb-2">{phoneNumber}</h4>
                        <p className="text-muted">{callStatus}</p>
                        {callStatus === "Connected" && (
                          <div className="mb-2">
                            <span className="badge bg-success">{formatTime(callTimer)}</span>
                          </div>
                        )}
                      </div>
                      {/* Show dial pad and controls if: 
                          - outgoing and callStatus === "Connected"
                          - incoming (after answer, always show) */}
                      {(callDirection === 'incoming' || (callDirection === 'outgoing' && callStatus === "Connected")) && (
                        <>
                          {/* Dial Pad */}
                          <div className="dial-pad mb-3 d-flex justify-content-center">
                            <div className="d-flex flex-wrap justify-content-center mx-auto" style={{ maxWidth: 220 }}>
                              {[1,2,3,4,5,6,7,8,9,'*',0,'#'].map((num, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  className="btn btn-outline-secondary m-1"
                                  style={{ width: 50, height: 50, fontSize: '1.2rem' }}
                                  onClick={() => handleDTMF(num)}
                                >
                                  {num}
                                </button>
                              ))}
                            </div>
                          </div>
                          {/* Controls */}
                          <div className="d-flex justify-content-center gap-2 mb-2">
                            <CButton 
                              color={isMuted ? "secondary" : "light"}
                              className="rounded-circle"
                              onClick={toggleMute}
                              title={isMuted ? "Unmute" : "Mute"}
                            >
                              <FontAwesomeIcon icon={faMicrophone} style={{ opacity: isMuted ? 0.4 : 1 }} />
                            </CButton>
                            <CButton 
                              color="light"
                              className="rounded-circle"
                              title="Speaker (not supported in browser)"
                              disabled
                            >
                              <FontAwesomeIcon icon={faPhone} />
                            </CButton>
                            <CButton 
                              color="danger"
                              className="rounded-circle"
                              onClick={handleEndCall}
                              title="Hangup"
                            >
                              <FontAwesomeIcon icon={faPhoneSlash} />
                            </CButton>
                          </div>
                        </>
                      )}
                      {/* Show only hangup if outgoing and not yet connected */}
                      {callDirection === 'outgoing' && callStatus !== "Connected" && (
                        <div className="d-flex justify-content-center">
                          <CButton 
                            color="danger" 
                            size="lg" 
                            className="rounded-circle p-3"
                            onClick={handleEndCall}
                          >
                            <FontAwesomeIcon icon={faPhoneSlash} style={{ fontSize: '1.5rem' }} />
                          </CButton>
                        </div>
                      )}
                    </div>
                  )}
                  {!isCallActive && (
                    <div className="dialer-content p-4">
                      <div className="phone-input-container mb-4">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Enter phone number"
                          value={phoneNumber}
                          onChange={e => setPhoneNumber(e.target.value)}
                        />
                        {/* Dial Pad */}
                        <div className="dial-pad mt-3 d-flex justify-content-center">
                          <div className="d-flex flex-wrap justify-content-center mx-auto" style={{ maxWidth: 220 }}>
                            {[1,2,3,4,5,6,7,8,9,'*',0,'#'].map((num, idx) => (
                              <button
                                key={idx}
                                type="button"
                                className="btn btn-outline-secondary m-1"
                                style={{ width: 60, height: 60, fontSize: '1.5rem' }}
                                onClick={() => setPhoneNumber(phoneNumber + num.toString())}
                              >
                                {num}
                              </button>
                            ))}
                            <button
                              type="button"
                              className="btn btn-outline-danger m-1"
                              style={{ width: 60, height: 60, fontSize: '1.5rem' }}
                              onClick={() => setPhoneNumber(phoneNumber.slice(0, -1))}
                            >
                              &#9003;
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="action-buttons">
                        <CButton 
                          color="success"
                          size="lg"
                          className="call-button px-4 py-2 w-100"
                          onClick={() => handleCall(phoneNumber)}
                          disabled={!phoneNumber}
                        >
                          <FontAwesomeIcon icon={faPhone} className="me-2" />
                          Call
                        </CButton>
                      </div>
                    </div>
                  )}
                </div>
              </CModalBody>
            </CModal>
          )}
          
          {isIncomingModalOpen && (
            <CModal
              visible={isIncomingModalOpen}
              onClose={handleReject}
              size="sm"
              alignment="center"
              className="dialer-modal"
              backdrop="static"
            >
              <CModalHeader className="border-0 bg-transparent">
                <CModalTitle className="text-center w-100">
                  <FontAwesomeIcon icon={faPhone} className="text-primary me-2" />
                  Incoming Call
                </CModalTitle>
              </CModalHeader>
              <CModalBody>
                <div className="text-center p-4">
                  <FontAwesomeIcon 
                    icon={faPhone} 
                    className="text-success mb-3"
                    style={{ fontSize: '3rem' }}
                  />
                  <h4 className="mb-3">From: {incomingCaller}</h4>
                  <div className="d-flex justify-content-center gap-3 mt-4">
                    <CButton color="success" size="lg" className="px-4" onClick={handleAnswer}>
                      <FontAwesomeIcon icon={faPhone} className="me-2" />
                      Answer
                    </CButton>
                    <CButton color="danger" size="lg" className="px-4" onClick={handleReject}>
                      <FontAwesomeIcon icon={faPhoneSlash} className="me-2" />
                      Reject
                    </CButton>
                  </div>
                </div>
              </CModalBody>
            </CModal>
          )}
          
          <CHeaderNav>
            <AppHeaderDropdown />
          </CHeaderNav>
        </div>
      </CContainer>
      <audio ref={remoteAudioRef} autoPlay style={{ display: 'none' }} />
    </CHeader>
  )
}

export default AppHeader
