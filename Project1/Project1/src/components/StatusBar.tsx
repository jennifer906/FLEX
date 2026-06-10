export default function StatusBar({ dark = false }: { dark?: boolean }) {
  const color = dark ? "#fff" : "#1C1C1E";
  return (
    <div className="status-bar flex-shrink-0" style={{ height: 44 }}>
      <span style={{ fontSize: 15, fontWeight: 600, color }}>4:40</span>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {/* Signal */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill={color}>
          <rect x="0" y="5" width="3" height="7" rx="1"/>
          <rect x="4.5" y="3.5" width="3" height="8.5" rx="1"/>
          <rect x="9" y="1.5" width="3" height="10.5" rx="1"/>
          <rect x="13.5" y="0" width="3" height="12" rx="1"/>
        </svg>
        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill={color}>
          <path d="M8 9.5C8.83 9.5 9.5 10.17 9.5 11S8.83 12.5 8 12.5 6.5 11.83 6.5 11 7.17 9.5 8 9.5Z"/>
          <path d="M8 6.5C9.8 6.5 11.4 7.2 12.6 8.4L13.7 7.3C12.2 5.8 10.2 5 8 5S3.8 5.8 2.3 7.3L3.4 8.4C4.6 7.2 6.2 6.5 8 6.5Z" opacity="0.7"/>
          <path d="M8 3.5C10.7 3.5 13.1 4.5 14.9 6.3L16 5.2C13.9 3.1 11.1 2 8 2S2.1 3.1 0 5.2L1.1 6.3C2.9 4.5 5.3 3.5 8 3.5Z" opacity="0.4"/>
        </svg>
        {/* Battery */}
        <div style={{
          display: "flex", alignItems: "center",
          background: "#FFB800", borderRadius: 4,
          padding: "2px 5px", gap: 2,
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#1C1C1E" }}>56</span>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="#1C1C1E">
            <rect x="0.5" y="1.5" width="8" height="7" rx="2" stroke="#1C1C1E" strokeWidth="1" fill="none"/>
            <rect x="1.5" y="2.5" width="5.5" height="5" rx="1" fill="#1C1C1E"/>
            <path d="M9 4v2" stroke="#1C1C1E" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
