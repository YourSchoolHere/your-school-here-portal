import { Injectable } from '@angular/core';

import { createClient } from '@supabase/supabase-js';
import { env } from "../../../environments";

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  public client = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

  constructor() { }
}
