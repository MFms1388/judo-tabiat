const modal=document.getElementById('loginModal');
const open=()=>modal.classList.remove('hidden');
const close=()=>modal.classList.add('hidden');
document.getElementById('loginBtn').addEventListener('click',open);
document.getElementById('coachLogin').addEventListener('click',open);
document.getElementById('closeModal').addEventListener('click',close);
modal.addEventListener('click',e=>{if(e.target===modal)close()});
