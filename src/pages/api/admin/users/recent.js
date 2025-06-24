import { supabaseAdmin as supabase } from "@/lib/supabaseAdmin";

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Obtener usuarios creados en los últimos 7 días, ordenados por fecha descendente
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data, error } = await supabase
        .from('app_users')
        .select(`
          id,
          idsap,
          role,
          status,
          created_at,
          allowed_users(nombre)
        `)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(10); // Limitar a 10 resultados

      if (error) throw error;

      const users = data.map(user => ({
        id: user.id,
        idsap: user.idsap,
        role: user.role,
        status: user.status,
        nombre: user.allowed_users?.nombre || `Usuario ${user.idsap}`,
        created_at: user.created_at
      }));

      return res.status(200).json({ users });
    } catch (error) {
      console.error('Error fetching recent users:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}