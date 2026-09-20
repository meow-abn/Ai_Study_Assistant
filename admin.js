async function checkAdmin() {
  const { data } = await supabase.auth.getUser();
  const user = data.user;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile.role !== "admin") {
    alert("Access denied");
    window.location.href = "dashboard.html";
  }
}

async function loadUsers() {
  const { data } = await supabase.from("profiles").select("*");

  const container = document.getElementById("users");
  data.forEach(user => {
    container.innerHTML += `<p>${user.id}</p>`;
  });
}

async function loadNotes() {
  const { data } = await supabase.from("notes").select("*");

  const container = document.getElementById("all-notes");
  data.forEach(note => {
    container.innerHTML += `<p>${note.content}</p>`;
  });
}

checkAdmin();
loadUsers();
loadNotes();