document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mainNav = document.querySelector('.main-nav');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            mainNav.classList.toggle('active');
        });
    }
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Sayaç animasyonu için IntersectionObserver
    const statNumbers = document.querySelectorAll('.stat-number');
    if (statNumbers.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5
        });

        statNumbers.forEach(counter => {
            observer.observe(counter);
        });
    }

    // Kurs filtreleme
    const courseSearch = document.getElementById('courseSearch');
    const categoryFilter = document.getElementById('categoryFilter');
    const subjectFilter = document.getElementById('subjectFilter');
    const durationFilter = document.getElementById('durationFilter');

    if (courseSearch) {
        courseSearch.addEventListener('input', filterCourses);
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterCourses);
    }
    if (subjectFilter) {
        subjectFilter.addEventListener('change', filterCourses);
    }
    if (durationFilter) {
        durationFilter.addEventListener('change', filterCourses);
    }

    // Sayfa spesifik JavaScript
    const currentPage = document.body.dataset.page;
    
    if (currentPage) {
        switch(currentPage) {
            case 'courses':
                initCoursesPage();
                break;
            case 'teachers':
                initTeacherFilters();
                initTeachersPage();
                break;
            case 'gallery':
                initGalleryFilters();
                initGalleryPage();
                break;
            case 'contact':
                initContactPage();
                break;
        }
    }

    // Galeri lightbox işlemleri
    let currentImageIndex = 0;
    const galleryItems = [];
    const lightboxModal = document.getElementById('lightboxModal');

    // Galeri event listener'ları
    if (lightboxModal) {
        document.addEventListener('keydown', (e) => {
            if (lightboxModal.style.display === 'block') {
                if (e.key === 'ArrowLeft') {
                    changeLightboxImage(-1);
                } else if (e.key === 'ArrowRight') {
                    changeLightboxImage(1);
                } else if (e.key === 'Escape') {
                    closeLightbox();
                }
            }
        });
    }

    // SSS Akordiyon
    const faqQuestions = document.querySelectorAll('.faq-question');
    if (faqQuestions.length > 0) {
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const faqItem = question.parentElement;
                const isActive = faqItem.classList.contains('active');
                
                // Diğer tüm açık SSS'leri kapat
                document.querySelectorAll('.faq-item').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Tıklanan SSS'yi aç/kapat
                if (!isActive) {
                    faqItem.classList.add('active');
                }
            });
        });
    }
});

// Sayaç animasyonu fonksiyonu
function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    if (!target) return;
    
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// SSS Akordiyon
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        const isActive = faqItem.classList.contains('active');
        
        // Diğer tüm açık SSS'leri kapat
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Tıklanan SSS'yi aç/kapat
        if (!isActive) {
            faqItem.classList.add('active');
        }
    });
});

// Kurs filtreleme fonksiyonu
function filterCourses() {
    const courses = document.querySelectorAll('.course-card');
    if (!courses.length) return;

    const searchText = document.getElementById('courseSearch')?.value?.toLowerCase() || '';
    const category = document.getElementById('categoryFilter')?.value || '';
    const subject = document.getElementById('subjectFilter')?.value || '';
    const duration = document.getElementById('durationFilter')?.value || '';
    
    courses.forEach(course => {
        const courseTitle = course.querySelector('h3')?.textContent.toLowerCase() || '';
        const courseCategory = course.dataset.category;
        const courseSubject = course.dataset.subject;
        const courseDuration = course.dataset.duration;
        
        const matchesSearch = courseTitle.includes(searchText);
        const matchesCategory = !category || courseCategory === category;
        const matchesSubject = !subject || courseSubject === subject;
        const matchesDuration = !duration || courseDuration === duration;
        
        course.style.display = (matchesSearch && matchesCategory && matchesSubject && matchesDuration) ? 'block' : 'none';
    });
}

// Öğretmen filtreleme fonksiyonu
function filterTeachers() {
    const searchText = document.getElementById('teacherSearch').value.toLowerCase();
    const branch = document.getElementById('branchFilter').value;
    const experience = document.getElementById('experienceFilter').value;
    
    const teachers = document.querySelectorAll('.teacher-profile-card');
    
    teachers.forEach(teacher => {
        const teacherName = teacher.querySelector('h3').textContent.toLowerCase();
        const teacherBranch = teacher.dataset.branch;
        const teacherExperience = parseInt(teacher.dataset.experience);
        
        const matchesSearch = teacherName.includes(searchText);
        const matchesBranch = !branch || teacherBranch === branch;
        const matchesExperience = !experience || checkExperienceRange(teacherExperience, experience);
        
        if (matchesSearch && matchesBranch && matchesExperience) {
            teacher.style.display = 'block';
        } else {
            teacher.style.display = 'none';
        }
    });
}

// Deneyim aralığı kontrolü
function checkExperienceRange(teacherExp, filterRange) {
    switch(filterRange) {
        case '0-5':
            return teacherExp >= 0 && teacherExp <= 5;
        case '5-10':
            return teacherExp > 5 && teacherExp <= 10;
        case '10+':
            return teacherExp > 10;
        default:
            return true;
    }
}

// Öğretmen detaylarını göster
function showTeacherDetails(teacherId) {
    fetch(`/teachers/${teacherId}`)
        .then(response => response.json())
        .then(teacher => {
            const modalBody = document.querySelector('#teacherDetailModal .modal-body');
            modalBody.innerHTML = generateTeacherDetailHTML(teacher);
            document.getElementById('teacherDetailModal').style.display = 'block';
        })
        .catch(error => console.error('Öğretmen bilgileri alınamadı:', error));
}

// Öğretmen detay HTML oluştur
function generateTeacherDetailHTML(teacher) {
    return `
        <div class="teacher-detail">
            <div class="detail-header">
                <img src="${teacher.image}" alt="${teacher.name}">
                <div class="detail-info">
                    <h3>${teacher.name}</h3>
                    <p class="title">${teacher.title}</p>
                    <p class="branch">${teacher.branch}</p>
                </div>
            </div>
            <div class="detail-content">
                <div class="detail-section">
                    <h4>Eğitim Bilgileri</h4>
                    <p>${teacher.education}</p>
                </div>
                <div class="detail-section">
                    <h4>Deneyim</h4>
                    <p>${teacher.experience}</p>
                </div>
                <div class="detail-section">
                    <h4>Uzmanlık Alanları</h4>
                    <ul>
                        ${teacher.specialties.map(specialty => `<li>${specialty}</li>`).join('')}
                    </ul>
                </div>
            </div>
        </div>
    `;
}

// Filtreleme olaylarını dinle - Öğretmenler sayfası için
function initTeacherFilters() {
    const teacherSearch = document.getElementById('teacherSearch');
    const branchFilter = document.getElementById('branchFilter');
    const experienceFilter = document.getElementById('experienceFilter');

    if (teacherSearch) {
        teacherSearch.addEventListener('input', filterTeachers);
    }
    if (branchFilter) {
        branchFilter.addEventListener('change', filterTeachers);
    }
    if (experienceFilter) {
        experienceFilter.addEventListener('change', filterTeachers);
    }
}

// Galeri filtreleme
function initGalleryFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (filterButtons.length > 0) {
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const activeButton = document.querySelector('.filter-btn.active');
                if (activeButton) {
                    activeButton.classList.remove('active');
                }
                btn.classList.add('active');
                
                const filter = btn.dataset.filter;
                filterGallery(filter);
            });
        });
    }
}

function filterGallery(filter) {
    const items = document.querySelectorAll('.gallery-item');
    
    items.forEach(item => {
        if (filter === 'all' || item.dataset.category === filter) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Lightbox fonksiyonları
function openLightbox(imageId) {
    const lightboxModal = document.getElementById('lightboxModal');
    if (!lightboxModal) return;

    // Galeri verilerini topla
    const galleryItems = [];
    let currentImageIndex = 0;

    document.querySelectorAll('.gallery-item').forEach((item, index) => {
        const imageData = {
            id: item.dataset.id,
            src: item.querySelector('img')?.src,
            title: item.querySelector('h3')?.textContent,
            description: item.querySelector('p')?.textContent,
            date: item.querySelector('.gallery-date')?.textContent
        };
        galleryItems.push(imageData);
        
        if (imageData.id === imageId) {
            currentImageIndex = index;
        }
    });
    
    updateLightboxContent(currentImageIndex, galleryItems);
    lightboxModal.style.display = 'block';
}

function closeLightbox() {
    const lightboxModal = document.getElementById('lightboxModal');
    if (lightboxModal) {
        lightboxModal.style.display = 'none';
    }
}

function changeLightboxImage(direction) {
    const galleryItems = Array.from(document.querySelectorAll('.gallery-item'));
    if (!galleryItems.length) return;

    currentImageIndex = (currentImageIndex + direction + galleryItems.length) % galleryItems.length;
    updateLightboxContent(currentImageIndex, galleryItems);
}

function updateLightboxContent(index, items) {
    if (!items.length) return;

    const item = items[index];
    const lightboxImage = document.getElementById('lightboxImage');
    const lightboxTitle = document.getElementById('lightboxTitle');
    const lightboxDescription = document.getElementById('lightboxDescription');
    const lightboxDate = document.getElementById('lightboxDate');

    if (lightboxImage) lightboxImage.src = item.src;
    if (lightboxTitle) lightboxTitle.textContent = item.title;
    if (lightboxDescription) lightboxDescription.textContent = item.description;
    if (lightboxDate) lightboxDate.textContent = item.date;
}

// Sayfa başlatma fonksiyonları
function initCoursesPage() {
    // Kurslar sayfası özel kodları
}

function initTeachersPage() {
    // Öğretmenler sayfası özel kodları
}

function initGalleryPage() {
    // Galeri sayfası özel kodları
}

function initContactPage() {
    // İletişim sayfası özel kodları
} 