export default function GroqBadge() {
    return (
        <div className="fixed bottom-4 left-4 z-50">
            <a
                href="https://groq.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-transform hover:scale-105"
                aria-label="Powered by Groq"
            >
                <img
                    src="https://groq.com/wp-content/uploads/2024/03/PBG-mark1-color.svg"
                    alt="Powered by Groq for fast inference."
                    width="120"
                    height="40"
                    className="drop-shadow-sm"
                />
            </a>
        </div>
    );
} 