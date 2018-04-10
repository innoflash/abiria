define(["app", "js/profile/profileView"], function (app, View) {
    var $ = jQuery;
    var $$ = Dom7;
    var user = {};

    var bindings = [
        {
            element: '#profileOptions',
            event: 'click',
            handler: profileOptions
        }
    ];

    function preparePage() {
        user = Cookies.getJSON(cookienames.user);
        View.fillProfile(user);
        View.fillImage(user);
        $('#profPic').hide();

        var cameraOptions = {
            destinationType: Camera.DestinationType.FILE_URI,
            encodingType: Camera.EncodingType.JPEG,
            mediaType: Camera.MediaType.PICTURE,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY
        };

        pOptions = app.f7.actions.create({
            buttons: [
                // First group
                [
                    {
                        text: 'Profile Options',
                        label: true
                    },
                    {
                        text: 'Edit',
                        bold: true,
                        onClick: function () {
                            editProfile();
                        }
                    },
                    {
                        text: 'Change Picture',
                        bold: true,
                        onClick: function () {
                            navigator.camera.getPicture(pictureSuccess, pictureError, cameraOptions);
                        }
                    },
                    {
                        text: 'Change Password',
                        bold: true,
                        onClick: function () {
                            changePassword();
                        }
                    },
                    {
                        text: 'Delete',
                        bold: true,
                        onClick: function () {
                            deleteProfile();
                        }
                    }
                ],
                // Second group
                [
                    {
                        text: 'Cancel',
                        color: 'red'
                    }
                ]
            ]
        });

        profilePhotoPopover = app.f7.popover.create({
            el: '.popover-links',
            targetEl: '.profile-pic'
        });
        if (Cookies.get(cookienames.auth_side) == auth_side.abiri_direct) {
            $('.profile-pic').on('click', function () {
                profilePhotoPopover.open();
                $('#openFileChooser').on('click', function () {
                    navigator.camera.getPicture(pictureSuccess, pictureError, cameraOptions);
                });
                $('#profPic').on('change', function () {
                    profilePhotoPopover.close();
                });
            });
        } else {
            console.log(Cookies.get(cookienames.auth_side));
        }
    }


    function pictureSuccess(imageURI) {
        profilePhotoPopover.close();
        $('.profile-pic').attr('src', imageURI);
        var options = new FileUploadOptions();
        options.fileKey = "file";
        options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
        options.mimeType = "image/jpeg";
        options.chunkedMode = false;
        options.httpMethod = 'POST';

        var params = {
            id: user.id
        };
        options.params = params;

        var ft = new FileTransfer();
        var progress = 0;
        uploadDialog = app.f7.dialog.progress('Uploading image', progress);
        uploadDialog.setText('Please wait...');
        ft.onprogress = function(progressEvent) {
            if (progressEvent.lengthComputable) {
               // loadingStatus.setPercentage(progressEvent.loaded / progressEvent.total);
                uploadDialog.setProgress(progressEvent.loaded);
                uploadDialog.setText(((progressEvent.loaded / progressEvent.total) * 100) + "% done");
                if (progressEvent.loaded == progressEvent.total) {
                    uploadDialog.close();
                }
            } else {
                //loadingStatus.increment();
            }
        };
        ft.upload(imageURI, app_apis.abiri + "abiri-uploadpic", uploadSuccess.bind(this), uploadFail.bind(this), options);
    }

    function uploadFail(error) {
        try {
            uploadDialog.close();
        } catch (e) {
        }
        app.f7.dialog.alert(JSON.stringify(error, null));
    }

    function uploadSuccess(response) {
        try {
            uploadDialog.close();
        } catch (e) {
        }
        app.f7.dialog.alert(JSON.stringify(response));
    }

    function pictureError() {
        app.f7.dialog.alert('Cant picture from your gallery');
    }

    function changePassword() {
        app.mainView.router.navigate('/changepassword');
    }

    function deleteProfile() {
        app.f7.dialog.confirm('Are you sure you are done with us and you want to remove your profile?', function () {
            console.log('delete profile in progress');
            app.f7.dialog.preloader('Deleting profile');
            $.ajax({
                url: app_apis.abiri + 'abiri-deleteprofile',
                method: 'POST',
                timeout: 3000,
                data: {
                    id: user.id
                }
            }).success(function (data) {
                app.f7.dialog.alert(data.message, function () {
                    if (data.success == 1) {
                        Cookies.remove(cookienames.user);
                        Cookies.remove(cookienames.authenticated);
                        Cookies.remove(cookienames.default_car);
                        Cookies.remove(cookienames.auth_side);
                        Cookies.remove(cookienames.routes);
                        app.mainView.router.navigate({
                            url: '/index',
                            force: true,
                            ignoreCache: true
                        });
                    }
                });
            }).error(function (error) {
                console.log(error);
                app.f7.dialog.alert(messages.server_error);
            }).always(function () {
                app.f7.dialog.close();
            });
        });
    }

    function editProfile() {
        app.mainView.router.navigate('/editprofile');
    }

    function profileOptions() {
        pOptions.open();
    }

    function init() {
        preparePage();
        View.render({
            bindings: bindings
        });
    }

    function onOut() {
        /*app.f7.dialog.close();*/
        console.log('profile outting');
    }


    return {
        init: init,
        onOut: onOut
    };
});