$(document).ready(function() {
    toastr.options = {
        "closeButton": true,
        "progressBar": true,
        "positionClass": "toast-bottom-right"
    };
    $('.select2').select2({minimumResultsForSearch:-1});
    $('.bi-eye-fill').click(function() {
        var field = $(this).prev('.form-control');
        if (field.attr('type') == 'text') {
            field.attr('type', 'password');
        } else {
            field.attr('type', 'text');
        }
    });
    $('.ajax-link').click(function(evt) {
        var that = $(this),
            action = that.attr('href'),
            timeout = 3000,
            loading = $('.loading');
        evt.preventDefault();
        loading.show();
        $.ajax({
            url: action,
            success: function(data) {
                if (data.code) {
                    toastr.error(data.msg);
                } else {
                    toastr.success(data.msg);
                    setTimeout(function() {
                        location.href = data.url;
                    }, timeout);
                }
            },
            complete: function() {
                loading.hide();
            }
        });
    });
    $('.ajax-form').submit(function(evt) {
        var that = $(this),
            action = that.attr('action'),
            method = that.attr('method'),
            timeout = 3000,
            loading = $('.loading');
        evt.preventDefault();
        loading.show();
        $.ajax({
            url: action,
            method: method,
            data: that.serialize(),
            success: function(data) {
                if (data.code) {
                    toastr.error(data.msg);
                    that.find('.captcha').click();
                } else {
                    toastr.success(data.msg);
                    setTimeout(function() {
                        location.href = data.url;
                    }, timeout);
                }
            },
            complete: function() {
                loading.hide();
            }
        });
    });
});
