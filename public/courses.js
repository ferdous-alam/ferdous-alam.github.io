// Dynamically render courses from courses.json into the teaching page
function renderCourses(jsonPath, containerSelector) {
  fetch(jsonPath)
    .then(r => r.json())
    .then(courses => {
      const html = [
        '<div class="blogs-list">',
        ...courses.map((course, i) => `
          <a class="blog-item" href="${course.link || '#'}">
            <div class="blog-meta">${course.semester}</div>
            <h3 class="blog-title">${course.name}</h3>
            <div class="blog-subtitle">${course.topic}</div>
          </a>
          ${i < courses.length - 1 ? '<div class="blog-separator"></div>' : ''}
        `),
        '</div>'
      ].join('');
      document.querySelector(containerSelector).innerHTML = html;
    });
}
