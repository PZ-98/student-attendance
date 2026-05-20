import { supabase } from '@/lib/supabase';

/**
 * Risk Score Calculation:
 * risk = absent*2 + late + streak*3
 */
export const aiService = {
  async calculateStudentRisk(studentId: string) {
    // 1. Get recent attendance records
    const { data: records, error } = await supabase
      .from('attendance_records')
      .select('status, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) throw error;

    let absentCount = 0;
    let lateCount = 0;
    let currentStreak = 0;
    let streakActive = true;

    records.forEach((record, index) => {
      if (record.status === 'absent') {
        absentCount++;
        if (streakActive) currentStreak++;
      } else if (record.status === 'late') {
        lateCount++;
        streakActive = false;
      } else {
        streakActive = false;
      }
    });

    const riskScore = (absentCount * 2) + lateCount + (currentStreak * 3);
    
    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (riskScore > 15) riskLevel = 'high';
    else if (riskScore > 7) riskLevel = 'medium';

    // 2. Upsert to ai_insights
    const { error: upsertError } = await supabase
      .from('ai_insights')
      .upsert({
        student_id: studentId,
        risk_score: riskScore,
        risk_level: riskLevel,
        updated_at: new Date().toISOString(),
      });

    if (upsertError) throw upsertError;

    return { riskScore, riskLevel };
  },

  async getRiskSummary() {
    const { data, error } = await supabase
      .from('ai_insights')
      .select(`
        *,
        students (full_name, class_id, classes (name))
      `)
      .order('risk_score', { ascending: false });

    if (error) throw error;
    return data;
  }
};
