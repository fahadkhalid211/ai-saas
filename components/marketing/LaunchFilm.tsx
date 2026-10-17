'use client';

import { T, useT } from '@/lib/i18n/context';
import { useRef, useState } from 'react';
import { SIGNUP_HREF } from './content';
import { ButtonLink, Reveal, SectionHead } from './ui';

export const LAUNCH_FILM = {
  src: '/media/crescelo-launch-film.mp4',
  poster: '/media/crescelo-launch-film-poster.jpg',
  seconds: 40,
};

/**
 * The 40-second launch film, right after the hero. The hero says what Crescelo does; this shows it in the time it takes to
 * scroll past. Nothing downloads until the visitor presses play (preload="none", the poster is a 50 KB still), it never
 * starts by itself and never loops, so it cannot cost anyone data, sound or attention they did not choose to spend.
 * When it ends, the next step is offered right there instead of leaving the visitor at a frozen last frame.
 */
export function LaunchFilm() {
  const __t = useT();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [ended, setEnded] = useState(false);
  const [failed, setFailed] = useState(false);

  const play = () => {
    const v = videoRef.current;
    if (!v) return;
    setEnded(false);
    if (ended) v.currentTime = 0;
    // play() rejects if the browser blocks it or the file cannot load; the native controls stay available either way.
    v.play().catch(() => setPlaying(false));
  };

  const showOverlay = !playing || ended;

  return (
    <section id="film" className="mk-section mk-film-section" aria-labelledby="mk-film-title">
      <div className="mk-wrap">
        <SectionHead
          id="mk-film-title"
          align="center"
          eyebrow="Watch it work"
          title="Crescelo in 40 seconds"
          intro="A visitor asks a question at 9 pm. See what happens next."
        />
        <Reveal className="mk-film">
          <div className="mk-film-frame">
            <video
              ref={videoRef}
              className="mk-film-video"
              src={LAUNCH_FILM.src}
              poster={LAUNCH_FILM.poster}
              width={1920}
              height={1080}
              preload="none"
              playsInline
              controls={playing && !ended}
              aria-label={__t("Crescelo launch film, 40 seconds")}
              aria-describedby="mk-film-desc"
              onPlay={() => {
                setPlaying(true);
                setEnded(false);
              }}
              onEnded={() => setEnded(true)}
              onError={() => setFailed(true)}
            >
              <T>Your browser cannot play this video.</T>
            </video>

            {showOverlay && !failed ? (
              <div className={`mk-film-overlay ${ended ? 'is-ended' : ''}`}>
                <button type="button" className="mk-film-play" onClick={play}>
                  <span className="mk-film-play-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="28" height="28" focusable="false">
                      <path d={ended ? 'M12 5V2L7 6.5 12 11V8a5 5 0 1 1-5 5H5a7 7 0 1 0 7-8z' : 'M8 5v14l11-7z'} fill="currentColor" />
                    </svg>
                  </span>
                  <span className="mk-film-play-label">
                    <T>{ended ? 'Watch again' : 'Play the 40-second film'}</T>
                  </span>
                </button>
                {ended ? (
                  <div className="mk-film-next">
                    <ButtonLink href={SIGNUP_HREF}>
                      <T>Start free trial</T>
                    </ButtonLink>
                    <ButtonLink href="/playground" variant="ghost">
                      <T>Try the live demo</T>
                    </ButtonLink>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          {failed ? (
            <p className="mk-film-note" role="status">
              <T>The film could not be loaded. Try the live demo instead.</T>
            </p>
          ) : (
            <p className="mk-film-note">
              <T>Sound on for the best view. It never plays by itself.</T>
            </p>
          )}
          <p id="mk-film-desc" className="sr-only">
            <T>
              A 40-second film. A visitor asks a barbershop&apos;s website a question in the evening. The Crescelo assistant answers from the shop&apos;s own prices, offers free times, books Saturday at 10:00 and confirms it in the chat. The same assistant answers on WhatsApp and Telegram, each new lead is sent to Slack and Google Sheets, and the film ends with the three setup steps.
            </T>
          </p>
        </Reveal>
      </div>
    </section>
  );
}
