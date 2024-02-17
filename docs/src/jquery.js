$(document).ready(function() {
    
    $("#signup").click(function() {
        $("#first").fadeOut("fast", function() {
            $("#second").fadeIn("fast");
        });
    });
        
    $("#signin").click(function() {
        $("#second").fadeOut("fast", function() {
            $("#first").fadeIn("fast");
        });
    });
    
    $(function() {
        $("form[name='login_form']").validate({
            rules: {
                login_email_input: {
                    required: true,
                    email: true
                },
                login_password_input: {
                    required: true,
                }
            },
            submitHandler: function(form) {
                form.submit();
            }
        });
    });
                 
    $(function() {
        $("form[name='registration_form']").validate({
            rules: {
                email: {
                    required: true,
                    email: true
                },
                password: {
                    required: true,
                    minlength: 6
                },
                confirm_password: {
                    required: true,
                    minlength: 6,
                    equalTo: "#password"
                }
            },
            submitHandler: function(form) {
                form.submit();
            }
        });
    });
});