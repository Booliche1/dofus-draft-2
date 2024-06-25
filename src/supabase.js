// src/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://eorfbocdxsusmvwiecjt.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVvcmZib2NkeHN1c212d2llY2p0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTkzMzEzOTIsImV4cCI6MjAzNDkwNzM5Mn0.LaEkB2WBt2c_Okvqro6tGG-TB1JQBcs2jNv7xxPK1Bs'
export const supabase = createClient(supabaseUrl, supabaseKey)
