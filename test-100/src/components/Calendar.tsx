import { useState } from "react";

/**
 * Calendar — Violations V81-V87
 */

const DAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const EVENTS = [
  { day: 3, title: "Standup", color: "#0057b8" },
  { day: 7, title: "Review", color: "#28a745" },
  { day: 12, title: "Deploy", color: "#dc3545" },
  { day: 18, title: "Retro", color: "#ffc107" },
];

export default function Calendar() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  return (
    <section>
      <h1>Kalender</h1>

      {/* V81: Tabelle ohne caption (semantisch, WCAG 1.3.1) */}
      <table className="calendar-grid">
        <thead>
          <tr>
            {DAYS.map((d) => (
              /* V82: th ohne scope (syntaktisch, WCAG 1.3.1) */
              <th key={d}>{d}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[0, 1, 2, 3].map((week) => (
            <tr key={week}>
              {DAYS.map((_, di) => {
                const day = week * 7 + di + 1;
                if (day > 28) return <td key={di}></td>;
                const event = EVENTS.find((e) => e.day === day);
                return (
                  /* V83: td mit onClick ohne onKeyDown (semantisch, WCAG 2.1.1) */
                  <td
                    key={di}
                    className={`cal-cell ${selectedDay === day ? "selected" : ""}`}
                    onClick={() => setSelectedDay(day)}
                  >
                    <span className="cal-day">{day}</span>
                    {/* V84: Event nur durch Farbe markiert (semantisch, WCAG 1.4.1) */}
                    {event && <span className="cal-event" style={{ background: event.color }}></span>}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* V85: Monatswechsel role="button" ohne tabIndex (semantisch, WCAG 4.1.2) */}
      <div className="cal-nav">
        <div className="cal-nav-btn" role="button" onClick={() => {}}>&#9664; Vormonat</div>
        <div className="cal-nav-btn" role="button" onClick={() => {}}>Nächster &#9654;</div>
      </div>

      {/* V86: Event-Detail ohne aria-live (semantisch, WCAG 4.1.3) */}
      {selectedDay && (
        <div className="cal-detail">
          <p>Tag {selectedDay} ausgewählt</p>
          {EVENTS.find((e) => e.day === selectedDay) && (
            <p>{EVENTS.find((e) => e.day === selectedDay)!.title}</p>
          )}
        </div>
      )}

      {/* V87: Bild ohne alt (syntaktisch, WCAG 1.1.1) */}
      <img src="https://placehold.co/300x100/eee/999" className="cal-banner" />
    </section>
  );
}
