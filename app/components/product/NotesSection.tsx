"use client";

interface Note {
  name: string;
  image: string;
}

interface NotesSectionProps {
  topNotes: Note[];
  middleNotes: Note[];
  baseNotes: Note[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function NotesSection({
  topNotes,
  middleNotes,
  baseNotes,
  title = "Fragrance Composition",
  subtitle = "Discover the luxurious blend of notes",
  className = "",
}: NotesSectionProps) {
  const noteCategories = [
    {
      name: "Top Notes",
      notes: topNotes,
      description: "First impression, light and fresh",
      gradient: "from-rose-50 to-pink-50",
      borderColor: "border-rose-200",
    },
    {
      name: "Middle Notes",
      notes: middleNotes,
      description: "Heart of the fragrance, floral and rich",
      gradient: "from-gold-50 to-gold-50",
      borderColor: "border-gold-200",
    },
    {
      name: "Base Notes",
      notes: baseNotes,
      description: "Foundation, warm and lasting",
      gradient: "from-gray-50 to-stone-50",
      borderColor: "border-gray-200",
    },
  ];

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 tracking-wide">{title}</h3>
        {subtitle && (
          <p className="mt-2 text-gray-600 font-light">{subtitle}</p>
        )}
      </div>

      {/* Notes Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {noteCategories.map((category, index) => (
          <div
            key={category.name}
            className={`bg-gradient-to-br ${category.gradient} rounded-xl border ${category.borderColor} p-6 shadow-sm hover:shadow-md transition-shadow duration-300`}
          >
            {/* Category Header */}
            <div className="text-center mb-6">
              <h4 className="text-xl font-semibold text-gray-800 mb-2">
                {category.name}
              </h4>
              <p className="text-sm text-gray-600 font-light italic">
                {category.description}
              </p>
            </div>

            {/* Notes List */}
            <div className="space-y-4">
              {category.notes.map((note, noteIndex) => (
                <div
                  key={`${category.name}-${noteIndex}`}
                  className="flex items-center space-x-4 bg-white/60 backdrop-blur-sm rounded-lg p-3 hover:bg-white/80 transition-colors duration-200"
                >
                  {/* Note Name */}
                  <div className="flex-1">
                    <span className="font-medium text-gray-800 tracking-wide">
                      {note.name}
                    </span>
                  </div>
                </div>
              ))}

              {/* Empty state */}
              {category.notes.length === 0 && (
                <div className="text-center py-4">
                  <span className="text-gray-400 italic text-sm">
                    No notes specified
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Fragrance Journey */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-8 text-white">
        <div className="text-center">
          <h4 className="text-lg font-semibold mb-3">The Fragrance Journey</h4>
          <div className="flex justify-center items-center space-x-8 text-sm">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-rose-400 rounded-full mb-2"></div>
              <span className="font-medium">0-15 min</span>
              <span className="text-gray-300">Top Notes</span>
            </div>
            <div className="w-8 h-px bg-gray-400"></div>
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-gold-400 rounded-full mb-2"></div>
              <span className="font-medium">15 min - 3 hrs</span>
              <span className="text-gray-300">Middle Notes</span>
            </div>
            <div className="w-8 h-px bg-gray-400"></div>
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 bg-gray-400 rounded-full mb-2"></div>
              <span className="font-medium">3-8+ hrs</span>
              <span className="text-gray-300">Base Notes</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotesSection;