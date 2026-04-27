// src/components/ui/CoursePlayer.tsx
'use client'
import { useState, useRef } from 'react'

export interface Lesson {
  title: string
  videoUrl: string
  duration?: string
  free?: boolean
}

interface Props {
  courseTitle: string
  lessons: Lesson[]
}

export default function CoursePlayer({ courseTitle, lessons }: Props) {
  const [current, setCurrent] = useState(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  const lesson = lessons[current]

  function selectLesson(idx: number) {
    setCurrent(idx)
    setTimeout(() => videoRef.current?.play(), 100)
  }

  return (
    <div className="course-player-wrap">
      {/* Video area */}
      <div className="course-player-main">
        <div className="course-player-video-wrap">
          {lesson?.videoUrl ? (
            <video
              ref={videoRef}
              key={lesson.videoUrl}
              src={lesson.videoUrl}
              controls
              controlsList="nodownload"
              style={{ width: '100%', height: '100%', display: 'block', background: '#000' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: 'var(--t3)', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 48 }}>▶</div>
              <div style={{ fontSize: 14 }}>ویدیو در دسترس نیست</div>
            </div>
          )}
        </div>

        {/* Lesson title */}
        <div style={{ padding: '16px 20px', background: 'var(--b1)', borderBottom: '1px solid var(--bd)' }}>
          <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.5px' }}>
            جلسه {current + 1} از {lessons.length}
          </div>
          <div style={{ fontSize: 17, fontWeight: 900 }}>{lesson?.title}</div>
        </div>

        {/* Prev/Next navigation */}
        <div style={{ display: 'flex', gap: 8, padding: '12px 20px', background: 'var(--b1)' }}>
          <button
            onClick={() => current > 0 && selectLesson(current - 1)}
            disabled={current === 0}
            className="site-btn site-btn-outline"
            style={{ fontSize: 12, padding: '8px 14px', opacity: current === 0 ? .4 : 1 }}
          >
            ‹ جلسه قبل
          </button>
          <button
            onClick={() => current < lessons.length - 1 && selectLesson(current + 1)}
            disabled={current === lessons.length - 1}
            className="site-btn site-btn-gold"
            style={{ fontSize: 12, padding: '8px 14px', opacity: current === lessons.length - 1 ? .4 : 1 }}
          >
            جلسه بعد ›
          </button>
        </div>
      </div>

      {/* Playlist sidebar */}
      <div className="course-player-sidebar">
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--bd)', fontSize: 13, fontWeight: 800 }}>
          {courseTitle}
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {lessons.map((l, i) => (
            <button
              key={i}
              onClick={() => selectLesson(i)}
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 10, width: '100%', padding: '12px 16px',
                background: i === current ? 'var(--gd)' : 'transparent',
                border: 'none', borderBottom: '1px solid var(--bd)', cursor: 'pointer',
                textAlign: 'right', transition: 'background var(--ease)',
              }}
            >
              <div style={{
                width: 26, height: 26, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                background: i === current ? 'var(--gold)' : 'var(--b2)',
                color: i === current ? '#000' : 'var(--t3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 900,
              }}>
                {i === current ? '▶' : i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: i === current ? 800 : 500, color: i === current ? 'var(--gold)' : 'var(--t)', lineHeight: 1.45 }}>
                  {l.title}
                </div>
                {l.duration && (
                  <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{l.duration}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
