require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

(async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'operador@gmail.com',   // o cliente@gmail.com
    password: '123456'
  });
  if (error) { console.error(error.message); process.exit(1); }
  console.log('TOKEN:\n', data.session.access_token);
})();
