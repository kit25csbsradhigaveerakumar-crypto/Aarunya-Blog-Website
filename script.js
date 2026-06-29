const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const publishButton = document.getElementById("publishBtn");
const blogContainer = document.getElementById("blogContainer");
const searchInput = document.getElementById("searchInput");
const blogCount = document.getElementById("blogCount");
const charCount = document.getElementById("charCount");
const toast = document.getElementById("toast");
const themeToggle = document.getElementById("themeToggle");
const downloadPdf = document.getElementById("downloadPdf");

let blogs = JSON.parse(localStorage.getItem("blogs"))||[];

publishButton.addEventListener("click",publishBlog);
contentInput.addEventListener("input",updateCharacterCount);
searchInput.addEventListener("input", searchBlogs);
themeToggle.addEventListener("click", toggleTheme);
downloadPdf.addEventListener("click", exportPDF);

function publishBlog(){

    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if(title === "" || content === ""){

        showToast("⚠️ Please enter both Title and Content.");

        return;

    }
    const words = content.split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(words / 200));

    const blog = {
        id:Date.now(),
        title: title,
        content: content,
        date: new Date().toLocaleString(),
        readingTime: readingTime
    };

    blogs.unshift(blog);

    saveBlogs();

    displayBlogs();

    updateBlogCount();

    clearInputs();

    showToast("✅ Blog Published Successfully!");

}

function searchBlogs(){
    const searchText = searchInput.value.toLowerCase();
    const filteredBlogs = blogs.filter(function(blog){

        return(
            blog.title.toLowerCase().includes(searchText) || blog.content.toLowerCase().includes(searchText)
        );
    });

    displayFilteredBlogs(filteredBlogs);
}

function displayFilteredBlogs(filteredBlogs){

    blogContainer.innerHTML="";
    if(filteredBlogs.length === 0){

        blogContainer.innerHTML = `
        <div class="empty-state">
        <h2>No Matching Blogs 🔍</h2>
        <p>Try another keyword.</p>
        </div>
        `;
        return;
    }
    filteredBlogs.forEach(function(blog){
        const blogCard = document.createElement("div");
        blogCard.className="blog-card fade-in";
        blogCard.innerHTML=`
        <h2>${blog.title}</h2>
        <div class="blog-meta">
        <small>📅 ${blog.date}</small>
        <small>⏱️ ${blog.readingTime} min read</small>
        </div>
        <p>${blog.content}</p>
        <div class ="blog-actions">
        <button class="edit-btn" onclick="editBlog(${blog.id})">Edit</button>
        <button class="delete-btn" onclick="deleteBlog(${blog.id})">Delete</button>
        </div>
        `;
        blogContainer.appendChild(blogCard);
    });
}

function displayBlogs(){

    blogContainer.innerHTML="";

    if(blogs.length === 0){

        blogContainer.innerHTML= `
        <div class="empty-state">
            <h2>No Blogs Yet 📝</h2>
            <p>Start writing your first blog!</p>
        </div>
        `;

        return;
    }

    blogs.forEach(function(blog) {
        const blogCard = document.createElement("div");
        blogCard.className="blog-card fade-in";
        blogCard.innerHTML=`
        <h2>${blog.title}</h2>
        <div class="blog-meta">
        <small>📅 ${blog.date}</small>
        <small>⏱️ ${blog.readingTime} min read</small>
        </div>
        <p>${blog.content}</p>
        <div class="blog-actions">

        <button class="edit-btn" onclick="editBlog(${blog.id})">
        Edit
        </button>

        <button class="delete-btn" onclick="deleteBlog(${blog.id})">
        Delete
        </button>

        </div>

        `;

        blogContainer.appendChild(blogCard);
    });
}

function deleteBlog(id){
    const confirmDelete = confirm("Are you sure you want to delete this blog?");
    if(!confirmDelete) return;

    blogs = blogs.filter(function (blog){
        return blog.id !== id;
    });

    saveBlogs();
    displayBlogs();
    updateBlogCount();
    showToast("🗑️ Blog Deleted!");

}

function editBlog(id){
    const blog=blogs.find(function(blog){
        return blog.id === id;
    });

    titleInput.value=blog.title;
    contentInput.value=blog.content;
    updateCharacterCount();
    blogs=blogs.filter(function(blog){
        return blog.id !== id;
    });

    saveBlogs();
    displayBlogs();
    updateBlogCount();
    showToast("✏️ Blog Ready to Edit!");
}

function updateBlogCount(){

    blogCount.textContent=`Total Blogs : ${blogs.length}`;

}

function saveBlogs(){

    localStorage.setItem("blogs",JSON.stringify(blogs));

}

function updateCharacterCount(){
    charCount.textContent=contentInput.value.length;
}

function clearInputs(){
    titleInput.value="";
    contentInput.value="";
    charCount.textContent=0;
}


function showToast(message){

    toast.textContent=message;
    toast.classList.add("show");

    setTimeout(function(){
        toast.classList.remove("show");
    },2000);
}

function toggleTheme(){
    document.body.classList.toggle("dark");

    if(document.body.classList.contains("dark")){
        localStorage.setItem("theme","dark");
        themeToggle.textContent="☀️ Light Mode";
    }
    else{
        localStorage.setItem("theme","light");
        themeToggle.textContent="🌙 Dark Mode";
    }
}
displayBlogs();
updateBlogCount();

if(localStorage.getItem("theme") === "dark"){
    document.body.classList.add("dark");
    themeToggle.textContent="☀️ Light Mode";
}

function exportPDF(){

    if(blogs.length === 0){
        showToast("⚠️ No blogs to export!");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(46,125,50);
    doc.text("Aarunya Blog Collection", 20, 20);
    doc.setTextColor(0,0,0);

    

    let y = 35;

    blogs.forEach(function(blog, index){

        doc.setFontSize(16);
        doc.text((index + 1) + ". " + blog.title, 20, y);

        y += 8;

        doc.setFontSize(11);
        doc.text("Date: " + blog.date, 20, y);

        y += 8;

        const lines = doc.splitTextToSize(blog.content, 170);
        doc.text(lines, 20, y);

        y += (lines.length * 7) + 10;

        // New page if needed
        if(y > 260){
            doc.addPage();
            y = 20;
        }

    });

    doc.save("Aarunya_Blogs.pdf");

    showToast("📄 PDF Downloaded Successfully!");

}