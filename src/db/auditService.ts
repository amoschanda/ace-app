import { supabase } from '../lib/supabase';

export const saveAuditResult = async (userId: string, audit: string, videos: any) => {
  const { data, error } = await supabase
    .from('audits')
    .insert([{ user_id: userId, result: audit, videos_data: videos }])
  return { data, error };
};

export const getPastAudits = async (userId: string) => {
  const { data, error } = await supabase
    .from('audits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return { data, error };
};
