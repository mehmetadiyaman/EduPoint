document.addEventListener('DOMContentLoaded', function() {
    // Mobil menü toggle
    const menuToggles = document.querySelectorAll('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    menuToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            
            // Overlay oluştur/kaldır
            if (sidebar.classList.contains('active')) {
                const overlay = document.createElement('div');
                overlay.className = 'sidebar-overlay';
                document.body.appendChild(overlay);
                
                overlay.addEventListener('click', () => {
                    sidebar.classList.remove('active');
                    overlay.remove();
                });
            } else {
                const overlay = document.querySelector('.sidebar-overlay');
                if (overlay) overlay.remove();
            }
        });
    });

    // Ekran boyutu değiştiğinde
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('active');
            const overlay = document.querySelector('.sidebar-overlay');
            if (overlay) overlay.remove();
        }
    });

    // Modal işlemleri
    const modalButtons = document.querySelectorAll('[data-modal]');
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close');

    // Modal açma
    modalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.getAttribute('data-modal');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'block';
            }
        });
    });

    // Modal kapatma
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Dışarı tıklayınca modal kapatma
    window.addEventListener('click', (e) => {
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });

    // Form validasyonları
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('error');
                } else {
                    field.classList.remove('error');
                }
            });

            if (!isValid) {
                e.preventDefault();
                alert('Lütfen tüm gerekli alanları doldurun.');
            }
        });
    });

    // Resim önizleme
    const imageInputs = document.querySelectorAll('input[type="file"]');
    imageInputs.forEach(input => {
        input.addEventListener('change', function(e) {
            const preview = document.querySelector(`#${input.id}-preview`);
            if (preview && this.files && this.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                }
                reader.readAsDataURL(this.files[0]);
            }
        });
    });

    // Alert mesajlarını otomatik gizle
    const alerts = document.querySelectorAll('.alert');
    
    alerts.forEach(alert => {
        if (alert.textContent.trim().length > 0) {
            setTimeout(() => {
                alert.classList.add('fade-out');
                setTimeout(() => {
                    alert.remove();
                }, 500);
            }, 3000);
        } else {
            alert.remove();
        }
    });

    // Form submit olaylarını dinle
    const editAnnouncementForm = document.getElementById('editAnnouncementForm');
    if (editAnnouncementForm) {
        editAnnouncementForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Form submit edildi');
            updateAnnouncement();
        });
    }

    // Duyuru ekleme formu
    const addAnnouncementForm = document.getElementById('addAnnouncementForm');
    if (addAnnouncementForm) {
        addAnnouncementForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addAnnouncement();
        });
    }
});

// Global yardımcı fonksiyonlar
function showLoading() {
    const loading = document.createElement('div');
    loading.className = 'loading';
    loading.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loading);
}

function hideLoading() {
    const loading = document.querySelector('.loading');
    if (loading) loading.remove();
}

function showError(message, details = '') {
    const alert = document.createElement('div');
    alert.className = 'alert alert-error';
    
    let errorContent = `<strong>Hata:</strong> ${message}`;
    if (details) {
        errorContent += `<br><small>${details}</small>`;
    }
    
    alert.innerHTML = errorContent;
    document.querySelector('.content-wrapper').prepend(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 5000); // 5 saniye göster
}

function showSuccess(message) {
    const alert = document.createElement('div');
    alert.className = 'alert alert-success';
    alert.textContent = message;
    document.querySelector('.content-wrapper').prepend(alert);
    
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// Kurs işlemleri
function editCourse(id) {
    showLoading();
    
    fetch(`/admin/courses/${id}`)
        .then(response => response.json())
        .then(data => {
            hideLoading();
            
            if (data.success) {
                const course = data.course;
                const modal = document.getElementById('editCourseModal');
                
                // Form alanlarını doldur
                document.getElementById('edit-id').value = course._id;
                document.getElementById('edit-name').value = course.name;
                document.getElementById('edit-description').value = course.description;
                document.getElementById('edit-duration').value = course.duration || '';
                document.getElementById('edit-category').value = course.category;
                
                if (course.features && course.features.length > 0) {
                    document.getElementById('edit-features').value = course.features.join('\n');
                }
                
                // Resim önizleme
                if (course.image) {
                    const preview = document.getElementById('edit-image-preview');
                    preview.src = course.image;
                    preview.style.display = 'block';
                }
                
                modal.style.display = 'block';
            } else {
                showError(data.message || 'Kurs bilgileri alınamadı');
            }
        })
        .catch(error => {
            hideLoading();
            console.error('Kurs bilgileri getirme hatası:', error);
            showError('Kurs bilgileri alınırken bir hata oluştu');
        });
}

function updateCourse() {
    const form = document.getElementById('editCourseForm');
    const formData = new FormData(form);
    const id = document.getElementById('edit-id').value;

    showLoading();

    fetch(`/admin/courses/${id}`, {
        method: 'PUT',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        
        if (data.success) {
            const modal = document.getElementById('editCourseModal');
            modal.style.display = 'none';
            showSuccess(data.message);
            setTimeout(() => location.reload(), 1000);
        } else {
            showError(data.message);
        }
    })
    .catch(error => {
        hideLoading();
        console.error('Kurs güncelleme hatası:', error);
        showError('Kurs güncellenirken bir hata oluştu');
    });
}

function deleteCourse(id) {
    if (confirm('Bu kursu silmek istediğinizden emin misiniz?')) {
        showLoading();

        fetch(`/admin/courses/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            hideLoading();
            
            if (data.success) {
                const courseCard = document.querySelector(`[data-id="${id}"]`);
                courseCard.remove();
                showSuccess('Kurs başarıyla silindi');
            } else {
                showError(data.message);
            }
        })
        .catch(error => {
            hideLoading();
            console.error('Kurs silme hatası:', error);
            showError('Kurs silinirken bir hata oluştu');
        });
    }
}

// Form submit olaylarını dinle
document.addEventListener('DOMContentLoaded', function() {
    const addCourseForm = document.getElementById('addCourseForm');
    if (addCourseForm) {
        addCourseForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            showLoading();

            fetch('/admin/courses', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                hideLoading();
                
                if (data.success) {
                    const modal = document.getElementById('addCourseModal');
                    modal.style.display = 'none';
                    showSuccess(data.message);
                    setTimeout(() => location.reload(), 1000);
                } else {
                    showError(data.message);
                }
            })
            .catch(error => {
                hideLoading();
                console.error('Kurs ekleme hatası:', error);
                showError('Kurs eklenirken bir hata oluştu');
            });
        });
    }

    const editCourseForm = document.getElementById('editCourseForm');
    if (editCourseForm) {
        editCourseForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateCourse();
        });
    }
});

// Öğretmen işlemleri
function addTeacher() {
    const form = document.getElementById('addTeacherForm');
    const description = form.querySelector('[name="description"]').value;

    // Açıklama uzunluğu kontrolü
    if (description.length < 10) {
        showError('Açıklama en az 10 karakter olmalıdır');
        return;
    }

    const formData = new FormData(form);
    showLoading();

    fetch('/admin/teachers', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        
        if (data.success) {
            const modal = document.getElementById('addTeacherModal');
            modal.style.display = 'none';
            showSuccess(data.message);
            setTimeout(() => location.reload(), 1000);
        } else {
            showError(data.message);
        }
    })
    .catch(error => {
        hideLoading();
        console.error('Öğretmen ekleme hatası:', error);
        showError('Öğretmen eklenirken bir hata oluştu');
    });
}

function editTeacher(id) {
    console.log('Düzenlenecek öğretmen ID:', id); // Debug için

    const modal = document.getElementById('editTeacherModal');
    modal.style.display = 'block';

    // Loading göster
    showLoading();

    fetch(`/admin/teachers/${id}`)
        .then(response => {
            console.log('Sunucu yanıtı:', response.status); // Debug için
            return response.json();
        })
        .then(data => {
            hideLoading();
            console.log('Gelen veri:', data); // Debug için

            if (data.success) {
                const teacher = data.teacher;
                // Form alanlarını doldur
                document.getElementById('edit-id').value = teacher._id;
                document.getElementById('edit-name').value = teacher.name;
                document.getElementById('edit-title').value = teacher.title;
                document.getElementById('edit-branch').value = teacher.branch;
                document.getElementById('edit-education').value = teacher.education;
                document.getElementById('edit-experience').value = teacher.experience;
                document.getElementById('edit-description').value = teacher.description;
                
                // Mevcut fotoğrafı göster
                const imagePreview = document.getElementById('edit-image-preview');
                if (teacher.image) {
                    imagePreview.src = teacher.image;
                    imagePreview.style.display = 'block';
                }
                
                // Sosyal medya bilgilerini doldur
                document.getElementById('edit-linkedin').value = teacher.socialMedia?.linkedin || '';
                document.getElementById('edit-twitter').value = teacher.socialMedia?.twitter || '';
                document.getElementById('edit-instagram').value = teacher.socialMedia?.instagram || '';
            } else {
                showError(data.message || 'Öğretmen bilgileri alınamadı');
                modal.style.display = 'none';
            }
        })
        .catch(error => {
            hideLoading();
            console.error('Öğretmen bilgileri getirme hatası:', error);
            showError('Öğretmen bilgileri alınırken bir hata oluştu');
            modal.style.display = 'none';
        });
}

function deleteTeacher(id) {
    if (confirm('Bu öğretmeni silmek istediğinizden emin misiniz?')) {
        fetch(`/admin/teachers/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const teacherCard = document.querySelector(`[data-id="${id}"]`);
                teacherCard.remove();
                showSuccess('Öğretmen başarıyla silindi');
            } else {
                showError(data.message);
            }
        })
        .catch(error => {
            console.error('Öğretmen silme hatası:', error);
            showError('Öğretmen silinirken bir hata oluştu');
        });
    }
}

// Form submit olaylarını dinle
document.addEventListener('DOMContentLoaded', function() {
    const addTeacherForm = document.getElementById('addTeacherForm');
    if (addTeacherForm) {
        addTeacherForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addTeacher();
        });
    }

    const editTeacherForm = document.getElementById('editTeacherForm');
    if (editTeacherForm) {
        editTeacherForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateTeacher();
        });
    }
});

function updateTeacher() {
    const form = document.getElementById('editTeacherForm');
    const formData = new FormData(form);
    const id = document.getElementById('edit-id').value;

    showLoading();

    fetch(`/admin/teachers/${id}`, {
        method: 'PUT',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        
        if (data.success) {
            const modal = document.getElementById('editTeacherModal');
            modal.style.display = 'none';
            
            showSuccess(data.message);
            
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            showError(data.message);
        }
    })
    .catch(error => {
        hideLoading();
        console.error('Öğretmen güncelleme hatası:', error);
        showError('Öğretmen güncellenirken bir hata oluştu');
    });
}

// Duyuru işlemleri
function editAnnouncement(id) {
    console.log('Düzenlenecek duyuru ID:', id);

    const modal = document.getElementById('editAnnouncementModal');
    modal.style.display = 'block';
    
    showLoading();

    fetch(`/admin/announcements/${id}`)
        .then(response => {
            console.log('Sunucu yanıtı:', response.status);
            return response.json();
        })
        .then(data => {
            hideLoading();
            console.log('Gelen veri:', data);

            if (data.success) {
                const announcement = data.announcement;
                document.getElementById('edit-id').value = announcement._id;
                document.getElementById('edit-title').value = announcement.title;
                document.getElementById('edit-content').value = announcement.content;
                document.getElementById('edit-important').checked = announcement.important;
                
                // Tarih varsa ayarla
                if (announcement.expiryDate) {
                    document.getElementById('edit-expiryDate').value = 
                        announcement.expiryDate.split('T')[0];
                }
                
                // Mevcut resmi göster
                const imagePreview = document.getElementById('edit-image-preview');
                if (announcement.image) {
                    imagePreview.src = announcement.image;
                    imagePreview.style.display = 'block';
                } else {
                    imagePreview.style.display = 'none';
                }
            } else {
                showError(data.message || 'Duyuru bilgileri alınamadı');
                modal.style.display = 'none';
            }
        })
        .catch(error => {
            hideLoading();
            console.error('Duyuru bilgileri getirme hatası:', error);
            showError('Duyuru bilgileri alınırken bir hata oluştu');
            modal.style.display = 'none';
        });
}

function updateAnnouncement() {
    const form = document.getElementById('editAnnouncementForm');
    const formData = new FormData(form);
    const id = document.getElementById('edit-id').value;

    console.log('Güncellenecek duyuru ID:', id);
    console.log('Form verileri:');
    for (let [key, value] of formData.entries()) {
        console.log(key, ':', value);
    }

    showLoading();

    fetch(`/admin/announcements/${id}`, {
        method: 'PUT',
        body: formData
    })
    .then(response => {
        console.log('Sunucu yanıt status:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        hideLoading();
        console.log('Sunucu yanıtı:', data);
        
        if (data.success) {
            const modal = document.getElementById('editAnnouncementModal');
            modal.style.display = 'none';
            
            showSuccess(data.message);
            
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            showError(data.message);
        }
    })
    .catch(error => {
        hideLoading();
        console.error('Güncelleme hatası:', error);
        showError('Duyuru güncellenirken bir hata oluştu');
    });
}

function deleteAnnouncement(id) {
    if (confirm('Bu duyuruyu silmek istediğinizden emin misiniz?')) {
        showLoading();

        fetch(`/admin/announcements/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            hideLoading();
            
            if (data.success) {
                const announcementCard = document.querySelector(`[data-id="${id}"]`);
                announcementCard.remove();
                showSuccess('Duyuru başarıyla silindi');
            } else {
                showError(data.message);
            }
        })
        .catch(error => {
            hideLoading();
            console.error('Duyuru silme hatası:', error);
            showError('Duyuru silinirken bir hata oluştu');
        });
    }
}

// Duyuru ekleme
function addAnnouncement() {
    const form = document.getElementById('addAnnouncementForm');
    const formData = new FormData(form);

    showLoading();

    fetch('/admin/announcements', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        
        if (data.success) {
            const modal = document.getElementById('addAnnouncementModal');
            modal.style.display = 'none';
            
            showSuccess(data.message);
            
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            showError(data.message);
        }
    })
    .catch(error => {
        hideLoading();
        showError('Duyuru eklenirken bir hata oluştu');
    });
}

// Galeri işlemleri
function editGalleryItem(id) {
    showLoading();
    
    fetch(`/admin/gallery/${id}`)
        .then(response => response.json())
        .then(data => {
            hideLoading();
            
            if (data.success) {
                const modal = document.getElementById('editGalleryModal');
                const item = data.galleryItem;

                // Form alanlarını doldur
                document.getElementById('edit-gallery-id').value = item._id;
                document.getElementById('edit-gallery-title').value = item.title;
                document.getElementById('edit-gallery-category').value = item.category;
                document.getElementById('edit-gallery-description').value = item.description || '';
                
                // Mevcut resmi göster
                const imagePreview = document.getElementById('edit-gallery-image-preview');
                if (item.image) {
                    imagePreview.src = item.image;
                    imagePreview.style.display = 'block';
                }
                
                modal.style.display = 'block';
            } else {
                showError(data.message || 'Galeri öğesi bilgileri alınamadı');
            }
        })
        .catch(error => {
            hideLoading();
            console.error('Galeri öğesi getirme hatası:', error);
            showError('Galeri öğesi bilgileri alınırken bir hata oluştu');
        });
}

function updateGalleryItem() {
    const form = document.getElementById('editGalleryForm');
    const formData = new FormData(form);
    const id = document.getElementById('edit-gallery-id').value;

    showLoading();

    fetch(`/admin/gallery/${id}`, {
        method: 'PUT',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        hideLoading();
        
        if (data.success) {
            const modal = document.getElementById('editGalleryModal');
            modal.style.display = 'none';
            showSuccess(data.message);
            setTimeout(() => location.reload(), 1000);
        } else {
            showError(data.message);
        }
    })
    .catch(error => {
        hideLoading();
        console.error('Galeri öğesi güncelleme hatası:', error);
        showError('Galeri öğesi güncellenirken bir hata oluştu');
    });
}

function deleteGalleryItem(id) {
    if (confirm('Bu galeri öğesini silmek istediğinizden emin misiniz?')) {
        showLoading();

        fetch(`/admin/gallery/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            hideLoading();
            
            if (data.success) {
                const galleryItem = document.querySelector(`[data-id="${id}"]`);
                galleryItem.remove();
                showSuccess('Galeri öğesi başarıyla silindi');
            } else {
                showError(data.message);
            }
        })
        .catch(error => {
            hideLoading();
            console.error('Galeri öğesi silme hatası:', error);
            showError('Galeri öğesi silinirken bir hata oluştu');
        });
    }
}

// Dosya yükleme bilgilerini göster
function showUploadInfo(inputElement) {
    const infoDiv = document.createElement('div');
    infoDiv.className = 'upload-info';
    infoDiv.innerHTML = `
        <div class="info-content">
            <h4>Dosya Yükleme Bilgileri:</h4>
            <ul>
                <li>İzin verilen formatlar: JPG, PNG, GIF</li>
                <li>Maksimum dosya boyutu: 5MB</li>
                <li>Önerilen boyutlar: 1000x1000px</li>
            </ul>
        </div>
    `;
    
    // Input elementinin yanına bilgi kutusunu ekle
    inputElement.parentNode.insertBefore(infoDiv, inputElement.nextSibling);
}

// Dosya seçildiğinde kontrol et
function validateFile(input) {
    const file = input.files[0];
    if (!file) return;

    // Dosya boyutu kontrolü
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        showError(`Dosya boyutu çok büyük (${(file.size/1024/1024).toFixed(2)}MB). Maksimum 5MB yükleyebilirsiniz.`);
        input.value = '';
        return;
    }

    // Dosya tipi kontrolü
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
        showError(`Geçersiz dosya formatı (${file.type}). Sadece JPG, PNG ve GIF formatları desteklenmektedir.`);
        input.value = '';
        return;
    }
} 