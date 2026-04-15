import WidgetKit
import SwiftUI

struct WidgetEventItem: Decodable, Identifiable {
    let id: String
    let title: String
    let address: String
    let time: String
    let paid: Bool
}

struct WidgetDaySnapshot: Decodable {
    let date: String
    let updatedAt: String
    let total: String
    let events: [WidgetEventItem]
    let displayMode: String?
    let anchorDate: String?
    let listDate: String?
    let listDateLabel: String?

    var isNextMode: Bool {
        (displayMode ?? "today").lowercased() == "next"
    }

    var subtitleListLabel: String {
        listDateLabel ?? listDate ?? date
    }
}

struct WidgetEntry: TimelineEntry {
    let date: Date
    let snapshot: WidgetDaySnapshot?
}

struct SnapshotStore {
    static let appGroup = "group.com.eventivapp.jm.garcia.widget"
    static let key = "day_snapshot"

    static func read() -> WidgetDaySnapshot? {
        guard let defaults = UserDefaults(suiteName: appGroup),
              let raw = defaults.string(forKey: key),
              let data = raw.data(using: .utf8) else {
            return nil
        }
        return try? JSONDecoder().decode(WidgetDaySnapshot.self, from: data)
    }
}

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> WidgetEntry {
        WidgetEntry(date: Date(), snapshot: nil)
    }

    func getSnapshot(in context: Context, completion: @escaping (WidgetEntry) -> Void) {
        completion(WidgetEntry(date: Date(), snapshot: SnapshotStore.read()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<WidgetEntry>) -> Void) {
        let entry = WidgetEntry(date: Date(), snapshot: SnapshotStore.read())
        let next = Calendar.current.date(byAdding: .minute, value: 30, to: Date()) ?? Date().addingTimeInterval(1800)
        completion(Timeline(entries: [entry], policy: .after(next)))
    }
}

private let bgTop = Color(red: 0.14, green: 0.09, blue: 0.28)
private let bgBottom = Color(red: 0.08, green: 0.05, blue: 0.16)
private let accent = Color(red: 0.76, green: 0.66, blue: 1.0)
private let muted = Color(red: 0.72, green: 0.68, blue: 0.88)

struct EventivWidgetEntryView: View {
    var entry: Provider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        Group {
            if #available(iOSApplicationExtension 17.0, *) {
                rootContent
                    .containerBackground(for: .widget) {
                        LinearGradient(colors: [bgTop, bgBottom], startPoint: .topLeading, endPoint: .bottomTrailing)
                    }
            } else {
                ZStack {
                    LinearGradient(colors: [bgTop, bgBottom], startPoint: .topLeading, endPoint: .bottomTrailing)
                    rootContent
                }
            }
        }
        .widgetURL(URL(string: "eventivapp://home?fromWidget=1"))
    }

    @ViewBuilder
    private var rootContent: some View {
        switch family {
        case .systemSmall:
            smallLayout
        case .systemMedium:
            mediumLayout
        case .systemLarge:
            largeLayout
        default:
            smallLayout
        }
    }

    // MARK: - Small

    private var smallLayout: some View {
        VStack(alignment: .leading, spacing: 0) {
            headerCompact
            Spacer(minLength: 4)
            if let snapshot = entry.snapshot {
                if snapshot.events.isEmpty && !snapshot.isNextMode {
                    Text("No tienes eventos hoy")
                        .font(.system(size: 13, weight: .semibold, design: .rounded))
                        .foregroundColor(.white.opacity(0.92))
                        .lineLimit(3)
                } else if snapshot.isNextMode {
                    Text("Sin eventos hoy")
                        .font(.caption2.weight(.semibold))
                        .foregroundColor(muted)
                    Text("Próximo: \(snapshot.subtitleListLabel)")
                        .font(.system(size: 12, weight: .bold, design: .rounded))
                        .foregroundColor(accent)
                        .lineLimit(2)
                    if let first = snapshot.events.first {
                        Spacer(minLength: 6)
                        Text(first.time)
                            .font(.caption.weight(.bold))
                            .foregroundColor(accent)
                        Text(first.title)
                            .font(.system(size: 13, weight: .semibold, design: .rounded))
                            .foregroundColor(.white)
                            .lineLimit(2)
                    } else {
                        Spacer(minLength: 4)
                        Text("Abre la app para ver detalles")
                            .font(.caption2)
                            .foregroundColor(muted)
                            .lineLimit(2)
                    }
                } else if let first = snapshot.events.first {
                    Text(first.time)
                        .font(.title3.weight(.bold))
                        .foregroundColor(accent)
                    Text(first.title)
                        .font(.system(size: 14, weight: .semibold, design: .rounded))
                        .foregroundColor(.white)
                        .lineLimit(2)
                    if snapshot.events.count > 1 {
                        Text("+\(snapshot.events.count - 1) más")
                            .font(.caption2.weight(.medium))
                            .foregroundColor(muted)
                            .padding(.top, 2)
                    }
                }
            } else {
                Text("Abre la app para sincronizar")
                    .font(.caption.weight(.medium))
                    .foregroundColor(muted)
                    .lineLimit(3)
            }
            Spacer(minLength: 0)
        }
        .padding(14)
    }

    // MARK: - Medium

    private var mediumLayout: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .firstTextBaseline) {
                headerTitle
                Spacer()
                if let snapshot = entry.snapshot, !snapshot.events.isEmpty {
                    Text(snapshot.total)
                        .font(.caption.weight(.semibold))
                        .foregroundColor(accent)
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.white.opacity(0.12))
                        .clipShape(Capsule())
                }
            }
            modeSubtitle

            if let snapshot = entry.snapshot {
                if snapshot.events.isEmpty && !snapshot.isNextMode {
                    Text("No tienes eventos para hoy")
                        .font(.subheadline.weight(.medium))
                        .foregroundColor(.white.opacity(0.85))
                } else {
                    VStack(alignment: .leading, spacing: 0) {
                        ForEach(Array(snapshot.events.prefix(3).enumerated()), id: \.offset) { index, event in
                            if index > 0 {
                                Divider().background(Color.white.opacity(0.15)).padding(.vertical, 6)
                            }
                            HStack(alignment: .top, spacing: 10) {
                                Text(event.time)
                                    .font(.caption.weight(.bold))
                                    .foregroundColor(accent)
                                    .frame(width: 44, alignment: .leading)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(event.title)
                                        .font(.caption.weight(.semibold))
                                        .foregroundColor(.white)
                                        .lineLimit(1)
                                    if !event.address.isEmpty {
                                        Text(event.address)
                                            .font(.caption2)
                                            .foregroundColor(muted)
                                            .lineLimit(1)
                                    }
                                }
                                Spacer(minLength: 0)
                                if event.paid {
                                    Text("Pagado")
                                        .font(.system(size: 9, weight: .bold))
                                        .foregroundColor(Color(red: 0.4, green: 0.95, blue: 0.65))
                                        .padding(.horizontal, 6)
                                        .padding(.vertical, 3)
                                        .background(Color(red: 0.2, green: 0.45, blue: 0.3).opacity(0.5))
                                        .clipShape(Capsule())
                                }
                            }
                        }
                    }
                }
            } else {
                Text("Sin datos sincronizados")
                    .font(.caption)
                    .foregroundColor(muted)
            }
            Spacer(minLength: 0)
        }
        .padding(14)
    }

    // MARK: - Large

    private var largeLayout: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .center) {
                VStack(alignment: .leading, spacing: 4) {
                    headerTitle
                    modeSubtitle
                }
                Spacer()
                if let snapshot = entry.snapshot, !snapshot.events.isEmpty {
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("Corte del día")
                            .font(.caption2)
                            .foregroundColor(muted)
                        Text(snapshot.total)
                            .font(.subheadline.weight(.bold))
                            .foregroundColor(accent)
                    }
                }
            }

            if let snapshot = entry.snapshot {
                if snapshot.events.isEmpty && !snapshot.isNextMode {
                    Text("No tienes eventos hoy")
                        .font(.title3.weight(.semibold))
                        .foregroundColor(.white.opacity(0.9))
                    Text("Revisa el calendario en la app o crea un evento nuevo.")
                        .font(.footnote)
                        .foregroundColor(muted)
                } else {
                    VStack(alignment: .leading, spacing: 8) {
                        ForEach(Array(snapshot.events.prefix(5).enumerated()), id: \.offset) { index, event in
                            if index > 0 {
                                Divider().background(Color.white.opacity(0.12))
                            }
                            HStack(alignment: .top, spacing: 12) {
                                Text(event.time)
                                    .font(.subheadline.weight(.bold))
                                    .foregroundColor(accent)
                                    .frame(width: 52, alignment: .leading)
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(event.title)
                                        .font(.subheadline.weight(.semibold))
                                        .foregroundColor(.white)
                                        .lineLimit(2)
                                    if !event.address.isEmpty {
                                        Text(event.address)
                                            .font(.caption)
                                            .foregroundColor(muted)
                                            .lineLimit(2)
                                    }
                                }
                                Spacer(minLength: 0)
                                if event.paid {
                                    Text("Pagado")
                                        .font(.system(size: 10, weight: .bold))
                                        .foregroundColor(Color(red: 0.55, green: 0.95, blue: 0.7))
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 4)
                                        .background(Color.white.opacity(0.1))
                                        .clipShape(Capsule())
                                }
                            }
                            .padding(.vertical, 2)
                        }
                    }
                }
            } else {
                Text("Abre Eventiva para cargar tu agenda.")
                    .font(.footnote)
                    .foregroundColor(muted)
            }

            Spacer(minLength: 0)
            HStack {
                Image(systemName: "hand.tap.fill")
                    .font(.caption2)
                    .foregroundColor(muted)
                Text("Toca para abrir la app")
                    .font(.caption2.weight(.medium))
                    .foregroundColor(muted.opacity(0.9))
            }
        }
        .padding(16)
    }

    // MARK: - Shared chrome

    private var headerCompact: some View {
        HStack {
            Image(systemName: "calendar")
                .font(.caption.weight(.bold))
                .foregroundColor(accent)
            Text("Hoy")
                .font(.caption.weight(.heavy))
                .foregroundColor(.white.opacity(0.95))
            Spacer()
        }
    }

    private var headerTitle: some View {
        HStack(spacing: 6) {
            Image(systemName: "calendar.badge.clock")
                .font(.subheadline.weight(.semibold))
                .foregroundColor(accent)
            Text("Eventos de hoy")
                .font(.subheadline.weight(.bold))
                .foregroundColor(.white)
        }
    }

    @ViewBuilder
    private var modeSubtitle: some View {
        if let snapshot = entry.snapshot {
            if snapshot.isNextMode {
                Text("Sin eventos hoy · Próximo: \(snapshot.subtitleListLabel)")
                    .font(.caption2)
                    .foregroundColor(muted)
                    .lineLimit(2)
            } else if !snapshot.events.isEmpty {
                Text("\(snapshot.subtitleListLabel) · Corte \(snapshot.total)")
                    .font(.caption2)
                    .foregroundColor(muted)
                    .lineLimit(1)
            } else {
                Text("Sin eventos programados")
                    .font(.caption2)
                    .foregroundColor(muted)
            }
        } else {
            Text("Sin datos sincronizados")
                .font(.caption2)
                .foregroundColor(muted)
        }
    }
}

struct EventivWidget: Widget {
    let kind: String = "EventivWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            EventivWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Eventos del dia")
        .description("Agenda: compacta en pequeno, detalle en grande.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}
