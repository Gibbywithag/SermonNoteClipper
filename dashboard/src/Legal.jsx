import React from 'react';
import { ArrowLeft } from 'lucide-react';

const LAST_UPDATED = '2026-06-01';

function Section({ title, children }) {
    return (
        <section className="mb-7">
            <h2 className="text-lg font-bold text-ink mb-2">{title}</h2>
            <div className="text-ink/80 leading-relaxed space-y-2 text-sm">{children}</div>
        </section>
    );
}

export default function Legal() {
    const handleBack = () => {
        window.location.hash = '';
    };

    return (
        <div className="min-h-screen bg-background text-ink">
            <header className="border-b border-line sticky top-0 bg-background/95 backdrop-blur z-10">
                <div className="max-w-3xl mx-auto px-6 py-4 flex items-center">
                    <button
                        onClick={handleBack}
                        className="text-muted hover:text-ink flex items-center gap-2 text-sm"
                    >
                        <ArrowLeft size={16} /> Back
                    </button>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-6 py-12">
                <h1 className="font-display text-4xl md:text-5xl mb-2">Terms &amp; Privacy</h1>
                <p className="text-muted text-sm mb-10">Last updated: {LAST_UPDATED}</p>

                <Section title="The short version">
                    <p>
                        Sermon Note Clipper is a free, open-source tool that you run on your own computer or
                        server. There are no accounts and no payments. Your videos are processed on the machine
                        that runs this instance and are not sent to us — there is no "us" hosting a copy. By using
                        this tool you agree to the points below.
                    </p>
                </Section>

                <Section title="Provided as-is">
                    <p>
                        The software is provided free, on a best-effort basis, with no warranties of any kind and
                        no guarantee of uptime, accuracy, or fitness for any particular purpose. To the maximum
                        extent permitted by law, the authors and contributors are not liable for any damages
                        arising from your use of the software.
                    </p>
                </Section>

                <Section title="You are responsible for what you upload">
                    <p>
                        Before processing a video, you must affirmatively confirm — via the checkbox in the upload
                        interface — that you own the content or have the rights to process it. By doing so you
                        represent and warrant that:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>You own all rights to the content, or have a valid license or permission to process it;</li>
                        <li>The content does not infringe any third-party copyright, trademark, privacy, or other right;</li>
                        <li>The content is not unlawful, defamatory, or otherwise prohibited.</li>
                    </ul>
                    <p>
                        If you process content you do not have rights to, that is your responsibility. The authors
                        and contributors are not responsible for how an instance is used.
                    </p>
                </Section>

                <Section title="What is stored, and where">
                    <ul className="list-disc pl-6 space-y-1">
                        <li>
                            <strong className="text-ink">Uploaded videos and generated clips:</strong> stored only
                            on the machine running this instance, in its <code className="text-ink bg-stone px-1 py-0.5 rounded">uploads/</code> and{' '}
                            <code className="text-ink bg-stone px-1 py-0.5 rounded">output/</code> folders, and automatically deleted with their
                            job (typically within 1 hour).
                        </li>
                        <li>
                            <strong className="text-ink">Attestation record (IP, user-agent, timestamp, source):</strong>{' '}
                            kept in memory with the job and discarded when the job is purged (≈1 hour). It only records
                            the ownership confirmation in case of a dispute.
                        </li>
                        <li>
                            <strong className="text-ink">API keys (Gemini, ElevenLabs):</strong> stored
                            in your browser's <code className="text-ink bg-stone px-1 py-0.5 rounded">localStorage</code> with light
                            obfuscation (not strong encryption — anyone with access to your browser profile can read
                            them). They are sent as request headers when a feature needs them, used to call the relevant
                            third party, and never written to disk on the server.
                        </li>
                    </ul>
                    <p>
                        Optional cloud backup (AWS S3) is only active if the operator configures it. When enabled,
                        generated clips are copied to the operator's own S3 bucket.
                    </p>
                </Section>

                <Section title="Third-party APIs">
                    <p>
                        When you use a feature that requires it, the tool forwards relevant data to the third-party
                        API for which you provided a key — Google Gemini (AI analysis), ElevenLabs (optional dubbing).
                        Those services have their own terms and privacy
                        policies, which apply in addition to this notice.
                    </p>
                </Section>

                <Section title="Self-hosted by you">
                    <p>
                        Each instance of Sermon Note Clipper is operated by whoever runs it — typically you or your
                        organization. Data handling, retention, security, and any legal obligations for the content
                        you process are the responsibility of that operator. For questions about a specific instance,
                        contact the administrator who runs it.
                    </p>
                </Section>

                <Section title="Changes">
                    <p>
                        This notice may change between releases; the "Last updated" date above reflects the most
                        recent revision in this copy of the software.
                    </p>
                </Section>
            </main>
        </div>
    );
}
