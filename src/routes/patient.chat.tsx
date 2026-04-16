import { createFileRoute } from '@tanstack/react-router';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, Undo2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePatientData } from '@/hooks/usePatientData';
import { supabase } from '@/integrations/supabase/client';
import { recalculateRiskForPatient } from '@/lib/recalculateRisk';

export const Route = createFileRoute('/patient/chat')({
  component: ChatPage,
});

const quickReplies = [
  "I feel fine today",
  "I'm short of breath",
  "I forgot my medication",
  "I want to log my weight",
];

function ChatPage() {
  const { user, profile } = useAuth();
  const { chatMessages, medicalRecord, vitals, riskScores, refresh } = usePatientData(user?.id);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const latestRisk = riskScores[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  const sendMessage = async (text: string) => {
    if (!user || !text.trim()) return;
    setSending(true);

    // Save user message
    await supabase.from('chat_messages').insert({
      patient_id: user.id,
      role: 'user' as const,
      content: text.trim(),
    });

    // Build context for AI
    const context = {
      patientName: profile?.full_name,
      diagnosis: medicalRecord?.primary_diagnosis,
      comorbidities: medicalRecord?.comorbidities,
      latestVitals: vitals[0],
      currentRiskScore: latestRisk?.score,
      recentMessages: chatMessages.slice(-5).map(m => ({ role: m.role, content: m.content })),
    };

    // Call edge function for AI response
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-patient', {
        body: { message: text.trim(), context },
      });

      if (data) {
        // Save assistant message
        await supabase.from('chat_messages').insert({
          patient_id: user.id,
          role: 'assistant' as const,
          content: data.reply || "I understand. Let me help you with that.",
          extracted_vitals: data.extracted_vitals || null,
          risk_impact: data.risk_impact || null,
        });

        // If vitals extracted, log them
        if (data.extracted_vitals && Object.keys(data.extracted_vitals).length > 0) {
          await supabase.from('vitals').insert({
            patient_id: user.id,
            source: 'chatbot_extracted' as const,
            ...data.extracted_vitals,
          });
        }

        // If urgency is high, recalculate risk
        if (data.urgency === 'high') {
          await recalculateRiskForPatient(user.id, 'chatbot');
        }
      } else {
        // Fallback simulated response
        const simReply = simulateResponse(text.trim(), context);
        await supabase.from('chat_messages').insert({
          patient_id: user.id,
          role: 'assistant' as const,
          content: simReply.reply,
          extracted_vitals: simReply.extracted_vitals || null,
        });

        if (simReply.extracted_vitals && Object.keys(simReply.extracted_vitals).length > 0) {
          await supabase.from('vitals').insert({
            patient_id: user.id,
            source: 'chatbot_extracted' as const,
            ...simReply.extracted_vitals,
          });
          await recalculateRiskForPatient(user.id, 'chatbot');
        }
      }
    } catch {
      // Fallback simulated response
      const simReply = simulateResponse(text.trim(), {});
      await supabase.from('chat_messages').insert({
        patient_id: user.id,
        role: 'assistant' as const,
        content: simReply.reply,
        extracted_vitals: simReply.extracted_vitals || null,
      });

      if (simReply.extracted_vitals && Object.keys(simReply.extracted_vitals).length > 0) {
        await supabase.from('vitals').insert({
          patient_id: user.id,
          source: 'chatbot_extracted' as const,
          ...simReply.extracted_vitals,
        });
        await recalculateRiskForPatient(user.id, 'chatbot');
      }
    }

    refresh();
    setInput('');
    setSending(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Chat Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-lau-border mb-4">
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-heading font-semibold text-foreground">Care Assistant</h2>
          <p className="text-xs text-muted-foreground font-body">Available 24/7 · Your data is private</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {chatMessages.length === 0 && (
          <div className="text-center py-12">
            <Bot className="h-12 w-12 text-primary/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground font-body">
              Hi {firstName}, how are you feeling today? You can tell me about any symptoms, log your vitals, or ask questions about your recovery.
            </p>
          </div>
        )}

        {chatMessages.map((msg, i) => (
          <motion.div key={msg.id || i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm font-body ${
              msg.role === 'user'
                ? 'bg-primary/10 text-foreground rounded-br-sm'
                : 'bg-card border border-lau-border text-foreground rounded-bl-sm'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.extracted_vitals && Object.keys(msg.extracted_vitals).length > 0 && (
                <div className="mt-2 p-2 rounded-lg bg-primary/5 border border-primary/20 text-xs">
                  <p className="font-semibold text-primary">📊 Logged vitals:</p>
                  {Object.entries(msg.extracted_vitals as Record<string, any>).map(([k, v]) => (
                    <p key={k} className="text-foreground capitalize">{k.replace(/_/g, ' ')}: {String(v)}</p>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-card border border-lau-border rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none">
        {quickReplies.map(qr => (
          <button key={qr} onClick={() => sendMessage(qr)} disabled={sending}
            className="whitespace-nowrap px-3 py-1.5 rounded-full border border-lau-border bg-card text-xs font-body text-foreground hover:border-primary hover:bg-primary/5 transition-colors disabled:opacity-50">
            {qr}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 rounded-full border border-lau-border bg-card text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          disabled={sending} />
        <button onClick={() => sendMessage(input)} disabled={sending || !input.trim()}
          className="h-11 w-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-lau-green-dark transition-colors disabled:opacity-50">
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Fallback simulated AI when edge function is unavailable
function simulateResponse(message: string, context: any) {
  const lower = message.toLowerCase();
  let reply = "Thank you for sharing that. I'll make sure your care team is aware. Is there anything else you'd like to tell me?";
  let extracted_vitals: any = null;
  let urgency = 'low';

  // Extract weight
  const weightMatch = lower.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilos?|kilogram)/);
  if (weightMatch) {
    extracted_vitals = { weight_kg: parseFloat(weightMatch[1]) };
    reply = `I've logged your weight as ${weightMatch[1]} kg. Thank you for keeping track! Is there anything else you'd like to share?`;
  }

  // Shortness of breath
  if (lower.includes('short of breath') || lower.includes('breathing') || lower.includes('can\'t breathe')) {
    urgency = 'high';
    reply = "I'm sorry to hear you're experiencing shortness of breath. This is important information. I've flagged this for your care team, and they'll be reaching out to you soon. In the meantime, try to rest in an upright position. If it becomes severe, please call emergency services.";
  }

  // Medication
  if (lower.includes('forgot') && lower.includes('medication')) {
    reply = "It's okay — missing a dose happens. Don't double up on your next dose. Take your regular dose at the next scheduled time. I've noted this for your care team.";
  }

  // Feeling fine
  if (lower.includes('feel fine') || lower.includes('feeling good') || lower.includes('doing well')) {
    reply = `That's wonderful to hear! Keep up the great recovery. Remember to keep taking your medications as prescribed and stay hydrated. 💪`;
  }

  // Gained weight
  if (lower.includes('gained') && lower.includes('weight') || lower.includes('weight gain')) {
    urgency = 'high';
    const gainMatch = lower.match(/gained?\s+(\d+(?:\.\d+)?)\s*(?:kg|kilos?|lbs?|pounds?)/);
    if (gainMatch) {
      const val = parseFloat(gainMatch[1]);
      extracted_vitals = { weight_kg: val };
      reply = `I've noted a weight gain of ${val} kg. Weight gain can be a sign of fluid retention, which is important for your care team to know. I've flagged this for review. Are you experiencing any swelling or shortness of breath?`;
    } else {
      reply = "Weight gain can be significant after discharge. Could you tell me how much weight you've gained? You can say something like 'I weigh 82 kg'.";
    }
  }

  return { reply, extracted_vitals, urgency };
}
