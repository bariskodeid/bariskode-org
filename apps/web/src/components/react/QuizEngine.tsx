import { useState, useEffect } from 'react';

interface QuizQuestion {
    id: string;
    question: string;
    type: 'multiple_choice' | 'true_false';
    order: number;
    options: { text: string }[];
}

interface QuizResult {
    questionId: string;
    isCorrect: boolean;
    selectedIndex: number;
    explanation: string | null;
}

interface SubmitResponse {
    score: number;
    passed: boolean;
    results: QuizResult[];
    attempts: number;
    xp: {
        awarded: number | null;
        source: 'already_completed' | 'pocketbase_hook_pending';
    };
    reviewAvailable: boolean;
}

type QuizState = 'loading' | 'ready' | 'in_progress' | 'submitting' | 'result';

interface Props {
    lessonId: string;
    lessonTitle: string;
    passingScore: number;
    maxAttempts: number;
    courseSlug?: string;
}

export default function QuizEngine({ lessonId, lessonTitle, passingScore, maxAttempts, courseSlug }: Props) {
    const [state, setState] = useState<QuizState>('loading');
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [answers, setAnswers] = useState<number[]>([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [result, setResult] = useState<SubmitResponse | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchQuestions();
    }, []);

    async function fetchQuestions() {
        try {
            const res = await fetch(`/api/quiz/${lessonId}/questions`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data: QuizQuestion[] = await res.json();
            setQuestions(data);
            setAnswers(new Array(data.length).fill(-1));
            setState('ready');
        } catch {
            setError('Gagal memuat soal quiz.');
            setState('ready');
        }
    }

    function selectAnswer(questionIndex: number, optionIndex: number) {
        const newAnswers = [...answers];
        newAnswers[questionIndex] = optionIndex;
        setAnswers(newAnswers);
    }

    async function submitQuiz() {
        setState('submitting');
        try {
            const res = await fetch(`/api/quiz/${lessonId}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers }),
            });
            if (!res.ok) throw new Error('Submit failed');
            const data: SubmitResponse = await res.json();
            setResult(data);
            setState('result');
        } catch {
            setError('Gagal mengirim jawaban. Coba lagi.');
            setState('in_progress');
        }
    }

    function retry() {
        setAnswers(new Array(questions.length).fill(-1));
        setCurrentQ(0);
        setResult(null);
        setState('ready');
    }

    const allAnswered = answers.every((a) => a >= 0);
    const canRetry = maxAttempts === 0 || (result?.attempts ?? 0) < maxAttempts;

    // Loading
    if (state === 'loading') {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    // Error
    if (error && state !== 'in_progress') {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12 text-center">
                <div className="text-4xl mb-4">⚠️</div>
                <p className="text-[var(--color-text)] mb-4">{error}</p>
                <button onClick={fetchQuestions} className="h-10 px-5 rounded-xl text-sm font-bold" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}>
                    Coba Lagi
                </button>
            </div>
        );
    }

    // No questions
    if (questions.length === 0 && state === 'ready') {
        return (
            <div className="max-w-2xl mx-auto px-4 py-12 text-center">
                <div className="text-4xl mb-4">📝</div>
                <p className="text-[var(--color-muted)]">Quiz belum memiliki soal.</p>
            </div>
        );
    }

    // Result
    if (state === 'result' && result) {
        return (
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Score Card */}
                <div className="rounded-2xl border p-8 text-center mb-8" style={{
                    borderColor: result.passed ? 'var(--color-primary)' : 'var(--color-danger)',
                    backgroundColor: 'var(--color-surface)',
                }}>
                    <div className="text-6xl font-black font-mono mb-2" style={{
                        color: result.passed ? 'var(--color-primary)' : 'var(--color-danger)',
                    }}>
                        {result.score}%
                    </div>
                    <p className="text-lg font-bold mb-1" style={{
                        color: result.passed ? 'var(--color-primary)' : 'var(--color-danger)',
                    }}>
                        {result.passed ? '🎉 Lulus!' : '❌ Belum Lulus'}
                    </p>
                    <p className="text-sm text-[var(--color-muted)]">
                        Skor minimum: {passingScore}% · Percobaan: {result.attempts}
                        {result.passed && result.score === 100 && result.xp.source !== 'already_completed' && ' · 🌟 Perfect Score! Double XP!'}
                    </p>
                    {result.passed && result.xp.source === 'pocketbase_hook_pending' && (
                        <p className="text-sm font-medium mt-3 text-[var(--color-primary)]">
                            XP untuk kelulusan quiz akan disinkronkan oleh sistem.
                        </p>
                    )}
                </div>

                {/* Review */}
                {result.reviewAvailable ? (
                    <>
                        <h3 className="text-lg font-bold text-[var(--color-text)] mb-4">Review Jawaban</h3>
                        <div className="space-y-4">
                            {questions.map((q, i) => {
                                const r = result.results[i];
                                return (
                                    <div key={q.id} className="rounded-xl border p-5" style={{
                                        borderColor: r.isCorrect ? 'rgba(0,255,136,0.3)' : 'rgba(239,68,68,0.3)',
                                        backgroundColor: 'var(--color-surface)',
                                    }}>
                                        <div className="flex items-start gap-3 mb-3">
                                            <span className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0" style={{
                                                backgroundColor: r.isCorrect ? 'var(--color-primary)' : 'var(--color-danger)',
                                                color: 'var(--color-bg)',
                                            }}>
                                                {r.isCorrect ? '✓' : '✗'}
                                            </span>
                                            <p className="text-sm font-medium text-[var(--color-text)]">{q.question}</p>
                                        </div>
                                        <div className="space-y-1.5 ml-9">
                                            {q.options.map((opt, j) => {
                                                const isSelected = r.selectedIndex === j;
                                                let style: React.CSSProperties = { backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)' };
                                                if (isSelected && r.isCorrect) style = { backgroundColor: 'rgba(0,255,136,0.1)', borderColor: 'var(--color-primary)' };
                                                else if (isSelected && !r.isCorrect) style = { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'var(--color-danger)' };
                                                return (
                                                    <div key={j} className="flex items-center gap-2 px-3 py-2 rounded-lg border text-sm" style={style}>
                                                        <span style={{ color: isSelected ? (r.isCorrect ? 'var(--color-primary)' : 'var(--color-danger)') : 'var(--color-muted)' }}>
                                                            {isSelected ? (r.isCorrect ? '✓' : '✗') : '○'}
                                                        </span>
                                                        <span className="text-[var(--color-text)]">{opt.text}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        {r.explanation && (
                                            <div className="ml-9 mt-3 px-3 py-2 rounded-lg text-xs text-[var(--color-text-secondary)]" style={{ backgroundColor: 'var(--color-surface-alt)' }}>
                                                💡 {r.isCorrect ? r.explanation : `Jawabanmu belum tepat. ${r.explanation}`}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <div className="rounded-xl border p-5 mb-6" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}>
                        <h3 className="text-lg font-bold text-[var(--color-text)] mb-2">Review dikunci sementara</h3>
                        <p className="text-sm text-[var(--color-muted)]">
                            Untuk mencegah brute-force jawaban, detail koreksi baru akan ditampilkan setelah kamu lulus atau menghabiskan seluruh percobaan yang tersedia.
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 mt-8">
                    {!result.passed && canRetry && (
                        <button onClick={retry} className="h-11 px-6 rounded-xl text-sm font-bold" style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}>
                            Coba Lagi
                        </button>
                    )}
                    <a href={`/learn/${lessonId}`} className="flex items-center justify-center h-11 px-6 rounded-xl border text-sm font-medium" style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)', backgroundColor: 'var(--color-surface)' }}>
                        Kembali ke Lesson
                    </a>
                    {courseSlug && (
                        <a href={`/courses/${courseSlug}`} className="flex items-center justify-center h-11 px-6 rounded-xl border text-sm font-medium" style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)', backgroundColor: 'var(--color-surface)' }}>
                            Kembali ke Kursus
                        </a>
                    )}
                </div>
            </div>
        );
    }

    // Ready / In Progress
    const q = questions[currentQ];
    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-xl font-bold text-[var(--color-text)]">{lessonTitle}</h2>
                    <p className="text-sm text-[var(--color-muted)] mt-1">
                        Soal {currentQ + 1} dari {questions.length} · Skor minimum: {passingScore}%
                    </p>
                </div>
                {/* Progress dots */}
                <div className="flex gap-1.5">
                    {questions.map((_, i) => (
                        <button key={i} onClick={() => { setState('in_progress'); setCurrentQ(i); }}
                            className="w-3 h-3 rounded-full transition-all"
                            style={{ backgroundColor: i === currentQ ? 'var(--color-primary)' : answers[i] >= 0 ? 'var(--color-primary-dim)' : 'var(--color-border)' }}
                        />
                    ))}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 rounded-full mb-8" style={{ backgroundColor: 'var(--color-border)' }}>
                <div className="h-full rounded-full transition-all duration-300" style={{
                    width: `${((currentQ + 1) / questions.length) * 100}%`,
                    backgroundColor: 'var(--color-primary)',
                }} />
            </div>

            {/* Question */}
            <div className="mb-8">
                <p className="text-lg font-medium text-[var(--color-text)] mb-6">{q.question}</p>
                <div className="space-y-3">
                    {q.options.map((opt, j) => {
                        const isSelected = answers[currentQ] === j;
                        return (
                            <button key={j}
                                onClick={() => { selectAnswer(currentQ, j); setState('in_progress'); }}
                                className="flex items-center gap-4 w-full px-5 py-4 rounded-xl border text-left text-sm transition-all"
                                style={{
                                    borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                                    backgroundColor: isSelected ? 'var(--color-primary-glow)' : 'var(--color-surface)',
                                }}>
                                <span className="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold shrink-0" style={{
                                    backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                                    color: isSelected ? 'var(--color-bg)' : 'var(--color-muted)',
                                    border: isSelected ? 'none' : '1px solid var(--color-border)',
                                }}>
                                    {String.fromCharCode(65 + j)}
                                </span>
                                <span style={{ color: isSelected ? 'var(--color-text)' : 'var(--color-text-secondary)' }}>{opt.text}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
                <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                    disabled={currentQ === 0}
                    className="h-11 px-5 rounded-xl border text-sm font-medium transition-all disabled:opacity-30"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-muted)', backgroundColor: 'var(--color-surface)' }}>
                    ← Sebelumnya
                </button>

                {currentQ < questions.length - 1 ? (
                    <button onClick={() => setCurrentQ(currentQ + 1)}
                        className="h-11 px-5 rounded-xl text-sm font-bold transition-all"
                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-bg)' }}>
                        Selanjutnya →
                    </button>
                ) : (
                    <button onClick={submitQuiz}
                        disabled={!allAnswered || state === 'submitting'}
                        className="h-11 px-6 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                        style={{ backgroundColor: allAnswered ? 'var(--color-primary)' : 'var(--color-border)', color: 'var(--color-bg)' }}>
                        {state === 'submitting' ? 'Mengirim...' : 'Submit Quiz'}
                    </button>
                )}
            </div>
        </div>
    );
}
