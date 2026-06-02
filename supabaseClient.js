
const SUPABASE_URL = "https://kzjsqtinenysepnbzkdl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6anNxdGluZW55c2VwbmJ6a2RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNzM0MTUsImV4cCI6MjA5MzY0OTQxNX0.AM94WzrgKjyYs-S9nN353y0_KhHDVjwxMIhDGwH6duo";

// create client safely
window.client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);