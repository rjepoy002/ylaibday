const GALLERY_SUPABASE_URL =
    "https://liajjeatukvkjzolorrq.supabase.co";

  const GALLERY_SUPABASE_ANON_KEY =
    "sb_publishable_VvJ0ElfDbH4jtbP8BbLXiQ_LDHvRUEi";


  const gallerySupabase =
    window.supabase.createClient(
      GALLERY_SUPABASE_URL,
      GALLERY_SUPABASE_ANON_KEY
    );


  window.gallerySupabase =
    gallerySupabase;

document.addEventListener(
    "DOMContentLoaded",
    function () {


      const fileInput =
        document.getElementById(
          "galleryFileInput"
        );


      const preview =
        document.getElementById(
          "galleryPreview"
        );


      const uploadButton =
        document.getElementById(
          "galleryUploadButton"
        );


      const clearButton =
        document.getElementById(
          "galleryClearButton"
        );


      const status =
        document.getElementById(
          "galleryUploadStatus"
        );


      const uploadedGrid =
        document.getElementById(
          "uploadedGalleryGrid"
        );


      const galleryEmpty =
        document.getElementById(
          "galleryEmpty"
        );

      const uploadedGalleryPagination =
        document.getElementById(
          "uploadedGalleryPagination"
        );

      const uploadedGalleryPreviousPage =
        document.getElementById(
          "uploadedGalleryPreviousPage"
        );

      const uploadedGalleryNextPage =
        document.getElementById(
          "uploadedGalleryNextPage"
        );

      const uploadedGalleryPageInfo =
        document.getElementById(
          "uploadedGalleryPageInfo"
        );

      const uploaderNameModal =
        document.getElementById(
          "uploaderNameModal"
        );

      const uploaderNameForm =
        document.getElementById(
          "uploaderNameForm"
        );

      const uploaderNameInput =
        document.getElementById(
          "uploaderNameInput"
        );

      const uploaderNameClose =
        document.getElementById(
          "uploaderNameClose"
        );

      const uploaderNameCancel =
        document.getElementById(
          "uploaderNameCancel"
        );


      let selectedFiles = [];
      let uploaderName = "";

      let uploadedPhotos = [];

      let uploadedGalleryPage = 1;


      /*
       * ========================================
       * SETTINGS
       * ========================================
       */

      const MAX_FILES_PER_SELECTION = 20;

      const MAX_FILE_SIZE = 5 * 1024 * 1024;

      const MAX_IMAGE_WIDTH = 2200;

      const JPEG_QUALITY = 0.82;

      const UPLOADED_GALLERY_PAGE_SIZE = 12;


      /*
       * ========================================
       * STATUS
       * ========================================
       */

      function setStatus(
        message,
        type = ""
      ) {

        status.textContent = message;

        status.className =
          "gallery-upload-status " + type;

      }


      /*
       * ========================================
       * FILE SELECTION
       * ========================================
       */

      fileInput.addEventListener(
        "change",
        function () {

          const files =
            Array.from(
              fileInput.files || []
            );


          if (!files.length) {
            return;
          }


          const remainingSlots =
            MAX_FILES_PER_SELECTION -
            selectedFiles.length;


          if (remainingSlots <= 0) {

            setStatus(
              "You can select up to " +
              MAX_FILES_PER_SELECTION +
              " photos at a time.",
              "error"
            );

            fileInput.value = "";

            return;
          }


          const filesToAdd =
            files.slice(
              0,
              remainingSlots
            );


          let rejected = 0;


          filesToAdd.forEach(
            function (file) {

              const validType =
                [
                  "image/jpeg",
                  "image/png",
                  "image/webp"
                ].includes(
                  file.type
                );


              if (!validType) {
                rejected++;
                return;
              }


              if (
                file.size >
                MAX_FILE_SIZE
              ) {
                rejected++;
                return;
              }


              selectedFiles.push(file);

            }
          );


          fileInput.value = "";


          renderPreview();


          if (selectedFiles.length) {

            uploadButton.disabled = false;

            clearButton.hidden = false;

            let message =
              selectedFiles.length +
              " photo";

            if (
              selectedFiles.length !== 1
            ) {
              message += "s";
            }

            message += " selected";


            if (rejected) {

              message +=
                ". " +
                rejected +
                " file(s) skipped.";

            }


            setStatus(message);

          } else {

            uploadButton.disabled = true;

            clearButton.hidden = true;

            setStatus(
              "No valid photos selected.",
              "error"
            );

          }

        }
      );


      /*
       * ========================================
       * RENDER PREVIEW
       * ========================================
       */

      function renderPreview() {

        preview.innerHTML = "";


        selectedFiles.forEach(
          function (file, index) {

            const wrapper =
              document.createElement(
                "div"
              );

            wrapper.className =
              "gallery-preview-item";


            const image =
              document.createElement(
                "img"
              );

            image.alt =
              file.name;


            const reader =
              new FileReader();


            reader.onload =
              function (event) {

                image.src =
                  event.target.result;

              };


            reader.readAsDataURL(file);


            const removeButton =
              document.createElement(
                "button"
              );

            removeButton.type =
              "button";

            removeButton.className =
              "gallery-preview-remove";

            removeButton.innerHTML =
              "×";

            removeButton.setAttribute(
              "aria-label",
              "Remove " + file.name
            );


            removeButton.addEventListener(
              "click",
              function () {

                selectedFiles.splice(
                  index,
                  1
                );

                renderPreview();


                if (
                  selectedFiles.length === 0
                ) {

                  uploadButton.disabled =
                    true;

                  clearButton.hidden =
                    true;

                  setStatus("");

                }

              }
            );


            wrapper.appendChild(image);

            wrapper.appendChild(
              removeButton
            );

            preview.appendChild(
              wrapper
            );

          }
        );

      }


      /*
       * ========================================
       * CLEAR SELECTION
       * ========================================
       */

      clearButton.addEventListener(
        "click",
        function () {

          selectedFiles = [];

          uploaderName = "";

          fileInput.value = "";

          preview.innerHTML = "";

          uploadButton.disabled = true;

          clearButton.hidden = true;

          setStatus("");

        }
      );


      /*
       * ========================================
       * COMPRESS IMAGE
       * ========================================
       */

      async function compressImage(file) {

        return new Promise(
          function (resolve, reject) {

            const reader =
              new FileReader();


            reader.onerror =
              function () {

                reject(
                  new Error(
                    "Could not read image."
                  )
                );

              };


            reader.onload =
              function (event) {

                const image =
                  new Image();


                image.onerror =
                  function () {

                    reject(
                      new Error(
                        "Could not process image."
                      )
                    );

                  };


                image.onload =
                  function () {

                    let width =
                      image.width;

                    let height =
                      image.height;


                    if (
                      width >
                      MAX_IMAGE_WIDTH
                    ) {

                      const ratio =
                        MAX_IMAGE_WIDTH /
                        width;

                      width =
                        MAX_IMAGE_WIDTH;

                      height =
                        Math.round(
                          height * ratio
                        );

                    }


                    const canvas =
                      document.createElement(
                        "canvas"
                      );


                    canvas.width =
                      width;

                    canvas.height =
                      height;


                    const context =
                      canvas.getContext(
                        "2d"
                      );


                    context.drawImage(
                      image,
                      0,
                      0,
                      width,
                      height
                    );


                    canvas.toBlob(
                      function (blob) {

                        if (!blob) {

                          reject(
                            new Error(
                              "Image compression failed."
                            )
                          );

                          return;

                        }


                        resolve(blob);

                      },
                      "image/jpeg",
                      JPEG_QUALITY
                    );

                  };


                image.src =
                  event.target.result;

              };


            reader.readAsDataURL(file);

          }
        );

      }


      /*
       * ========================================
       * CREATE SAFE FILE NAME
       * ========================================
       */

      function createFileName() {

        const timestamp =
          Date.now();

        const random =
          Math.random()
            .toString(36)
            .substring(2, 10);


        return (
          "ylai_" +
          timestamp +
          "_" +
          random +
          ".jpg"
        );

      }


      function openUploaderNameModal() {

        uploaderNameInput.value =
          uploaderName;

        uploaderNameModal.hidden =
          false;

        document.body.style.overflow =
          "hidden";

        setTimeout(
          function () {
            uploaderNameInput.focus();
          },
          100
        );

      }


      function closeUploaderNameModal() {

        uploaderNameModal.hidden =
          true;

        document.body.style.overflow =
          "";

        uploadButton.focus();

      }


      /*
       * ========================================
       * UPLOAD PHOTOS
       * ========================================
       */

      async function uploadSelectedPhotos() {

          if (!selectedFiles.length) {
            return;
          }

          uploadButton.disabled = true;

          clearButton.disabled =
            true;


          const total =
            selectedFiles.length;


          let successful =
            0;


          let failed =
            0;


          setStatus(
            "Preparing photos..."
          );


          for (
            let i = 0;
            i < selectedFiles.length;
            i++
          ) {


            const originalFile =
              selectedFiles[i];


            try {


              setStatus(
                "Preparing photo " +
                (i + 1) +
                " of " +
                total +
                "..."
              );


              const compressedBlob =
                await compressImage(
                  originalFile
                );


              const fileName =
                createFileName();


              const storagePath =
                "photos/" +
                fileName;


              setStatus(
                "Uploading photo " +
                (i + 1) +
                " of " +
                total +
                "..."
              );


              const {
                error: uploadError
              } =
                await gallerySupabase
                  .storage
                  .from("gallery")
                  .upload(
                    storagePath,
                    compressedBlob,
                    {
                      contentType:
                        "image/jpeg",

                      cacheControl:
                        "31536000",

                      upsert:
                        false
                    }
                  );


              if (uploadError) {
                throw uploadError;
              }


              const {
                error: databaseError
              } =
                await gallerySupabase
                  .from("gallery_photos")
                  .insert({
                    file_name:
                      originalFile.name,

                    storage_path:
                      storagePath,

                    caption:
                      "A special memory with Ylai",

                    uploaded_by:
                      uploaderName,

                    approved:
                      true
                  });


              if (databaseError) {

                await gallerySupabase
                  .storage
                  .from("gallery")
                  .remove([
                    storagePath
                  ]);

                throw databaseError;

              }


              successful++;


            } catch (error) {

              console.error(
                "Gallery upload error:",
                error
              );

              failed++;

            }

          }


          selectedFiles = [];

          fileInput.value = "";

          preview.innerHTML = "";

          clearButton.hidden =
            true;

          clearButton.disabled =
            false;

          uploadButton.disabled =
            true;


          if (failed === 0) {

            setStatus(
              successful +
              " photo" +
              (
                successful !== 1
                  ? "s"
                  : ""
              ) +
              " uploaded successfully.",
              "success"
            );

          } else {

            setStatus(
              successful +
              " uploaded, " +
              failed +
              " failed.",
              "error"
            );

          }


          await loadUploadedGallery();

      }


      uploadButton.addEventListener(
        "click",
        openUploaderNameModal
      );


      uploaderNameForm.addEventListener(
        "submit",
        async function (event) {

          event.preventDefault();

          uploaderName =
            uploaderNameInput.value.trim();

          if (!uploaderName) {
            uploaderNameInput.focus();
            return;
          }

          closeUploaderNameModal();

          await uploadSelectedPhotos();

        }
      );


      uploaderNameClose.addEventListener(
        "click",
        closeUploaderNameModal
      );


      uploaderNameCancel.addEventListener(
        "click",
        closeUploaderNameModal
      );


      uploaderNameModal.addEventListener(
        "click",
        function (event) {

          if (event.target === uploaderNameModal) {
            closeUploaderNameModal();
          }

        }
      );


      /*
       * ========================================
       * LOAD UPLOADED GALLERY
       * ========================================
       */

      async function loadUploadedGallery(
        preservePage = false
      ) {

        uploadedGrid.innerHTML = "";


        const {
          data,
          error
        } =
          await gallerySupabase
            .from(
              "gallery_photos"
            )
            .select(
              "id,file_name,storage_path,caption,uploaded_by,created_at"
            )
            .eq(
              "approved",
              true
            )
            .order(
              "created_at",
              {
                ascending: false
              }
            );


        if (error) {

          console.error(
            "Gallery loading error:",
            error
          );

          galleryEmpty.hidden =
            false;

          uploadedGalleryPagination.hidden =
            true;

          galleryEmpty.textContent =
            "Unable to load shared photos.";

          return;

        }


        if (
          !data ||
          data.length === 0
        ) {

          galleryEmpty.hidden =
            false;

          uploadedPhotos = [];

          uploadedGalleryPagination.hidden =
            true;

          return;

        }


        galleryEmpty.hidden =
          true;


        uploadedPhotos =
          data;


        if (!preservePage) {

          uploadedGalleryPage =
            1;

        }


        const pageCount =
          Math.ceil(
            uploadedPhotos.length /
            UPLOADED_GALLERY_PAGE_SIZE
          );


        uploadedGalleryPage =
          Math.min(
            uploadedGalleryPage,
            pageCount
          );


        const start =
          (uploadedGalleryPage - 1) *
          UPLOADED_GALLERY_PAGE_SIZE;


        const pagePhotos =
          uploadedPhotos.slice(
            start,
            start + UPLOADED_GALLERY_PAGE_SIZE
          );


        uploadedGalleryPagination.hidden =
          uploadedPhotos.length <=
          UPLOADED_GALLERY_PAGE_SIZE;


        uploadedGalleryPageInfo.textContent =
          "Showing " +
          (start + 1) +
          "–" +
          Math.min(
            start + UPLOADED_GALLERY_PAGE_SIZE,
            uploadedPhotos.length
          ) +
          " of " +
          uploadedPhotos.length;


        uploadedGalleryPreviousPage.disabled =
          uploadedGalleryPage === 1;


        uploadedGalleryNextPage.disabled =
          uploadedGalleryPage === pageCount;


        pagePhotos.forEach(
          function (photo) {


            const {
              data: publicUrlData
            } =
              gallerySupabase
                .storage
                .from("gallery")
                .getPublicUrl(
                  photo.storage_path
                );


            const imageUrl =
              publicUrlData.publicUrl;


            const figure =
              document.createElement(
                "figure"
              );

            figure.className =
              "uploaded-gallery-item";


            const button =
              document.createElement(
                "button"
              );

            button.type =
              "button";


            button.setAttribute(
              "aria-label",
              "View shared photo"
            );


            button.addEventListener(
              "click",
              function () {

                openPhoto(
                  imageUrl,
                  photo.caption ||
                  "A special memory with Ylai."
                );

              }
            );


            const image =
              document.createElement(
                "img"
              );

            image.src =
              imageUrl;

            image.alt =
              photo.caption ||
              "Shared photo with Ylai";

            image.loading =
              "lazy";


            const zoomIcon =
              document.createElement(
                "span"
              );

            zoomIcon.className =
              "zoom-icon";

            zoomIcon.textContent =
              "+";


            button.appendChild(
              image
            );

            button.appendChild(
              zoomIcon
            );


            figure.appendChild(button);

            // Uploader name
            const uploader = document.createElement("figcaption");

            uploader.className = "uploaded-by";

            uploader.textContent =
              "Uploaded by " +
              (photo.uploaded_by || "Guest");

            figure.appendChild(uploader);

            uploadedGrid.appendChild(figure);

          }
        );

      }


      uploadedGalleryPreviousPage.addEventListener(
        "click",
        function () {

          if (uploadedGalleryPage > 1) {

            uploadedGalleryPage--;

            loadUploadedGallery(true);

          }

        }
      );


      uploadedGalleryNextPage.addEventListener(
        "click",
        function () {

          const pageCount =
            Math.ceil(
              uploadedPhotos.length /
              UPLOADED_GALLERY_PAGE_SIZE
            );


          if (uploadedGalleryPage < pageCount) {

            uploadedGalleryPage++;

            loadUploadedGallery(true);

          }

        }
      );


      /*
       * ========================================
       * INITIAL LOAD
       * ========================================
       */

      loadUploadedGallery();


    }
  );
