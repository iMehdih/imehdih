'use client'
export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      style={{
        background: '#c8a96e', color: '#000', border: 'none', borderRadius: 8,
        padding: '10px 22px', fontFamily: 'inherit', fontWeight: 900, fontSize: 14, cursor: 'pointer',
      }}
    >
      چاپ / ذخیره PDF
    </button>
  )
}
