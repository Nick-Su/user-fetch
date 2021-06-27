'use strict';

/**
 * Renders user list to the ceratin DOM node
 *
 * @param {User[]} userList the list of users
 */
const renderUserList = (userList) => {
  userList?.map(user => {
    if(typeof user.name !== 'undefined') {
      let html = `
      <div class='current-user'>
      <div class='current-user__user-info'>  
        <p id='name-${user.id}' class="current-user__name">${user.name}</p> 
        <div id='user-description-${user.id}' class='current-user__description'></div>
        </div>
      </div>  
      `;
      $('#catalog').append(html);  
    }
  });

  userList?.map(user => {
    if(typeof user.name !== 'undefined') {
      const btnId = '#name-' + user.id;

      $(btnId).click(function() {
        toggleUserAlbumsCatalog(user.id);
      })
    }
  })
}

/**
 * Hides or show user's albums catalog
 *
 * @param {number} userId id of clicked user.
 */
const toggleUserAlbumsCatalog = async (userId) => {
  const userDescriptionId = '#user-description-' + userId;
  const targetDivIdToRender = `#user-description-${userId}`;
  
  $(userDescriptionId).toggle();
  
  // On close album catalog, prevent making useless rerender & api call
  if($(userDescriptionId).css('display') !== 'block' ) {
    return
  }

  const albums = await getUserAlbums(userId);

  $(targetDivIdToRender).empty();
  
  albums?.map(album => {
    const html = `
      <div class="user-albums">
        <p class="user-albums__album-title" id="album-id-${album.id}">${album.title}</p>
        <div id='album-description-${album.id}' class='user-albums__album-description'></div>
      </div>
    `;
    $(targetDivIdToRender).append(html);
  });

  albums?.map(album => {
    let temp = document.getElementById('album-id-' + album.id);
    temp.addEventListener('click', function() {
      toggleAlbumDescription(album.id);
    })
  })
}

/**
 * Hides or show album's photo catalog
 *
 * @param {number} albumId id of clicked album.
 */
const toggleAlbumDescription = async (albumId) => {
  const albumDescriptionId = `#album-description-${albumId}`;
  const targetDivIdToRender = `#album-description-${albumId}`;

  $(albumDescriptionId).toggle();

  // On close album, prevent making useless rerender & api call
  if($(albumDescriptionId).css('display') !== 'block' ) {
    return
  }
  
  const photos = await getAlbumContent(albumId);

  photos?.map(photo => {
    const isSaved = localStorage.getItem(photo.id);
    let setselectedClass = "";

    if(isSaved) {
      setselectedClass = "selected";
    }

    let html = `
      <div clas='album-photo'>
        <div class="album-photo__photo-container">
          <div class="album-photo__img-container">
            <div class="album-photo__star">
              <i class="fas fa-star ${setselectedClass}" id="star-id-${photo.id}"></i>
            </div>
            <div class='album-photo__thumbnail'>
              <img src="${photo.thumbnailUrl}" id='img-${photo.id}'>
              <div>${photo.title}</div>
            </div>
          </div>
        </div>
      </div>
    `;
    $(targetDivIdToRender).append(html);
  })

  photos.map(photo => {
    const temp = `img-${photo.id}`;
    const starId = '#star-id-' + photo.id; 

    $(temp).click(function() {
      toggleFullImage(photo.url);
    });

    $(starId).click(function() {
      if($(starId).hasClass('selected')) {
        $(starId).removeClass('selected');
        localStorage.removeItem(photo.id);
      } else {
        $(starId).addClass('selected');
        localStorage.setItem(photo.id, photo.albumId)
      }
    });
  })
}

/**
 * Hides or show full image
 *
 * @param {string} photoUrl url to full-sized image.
 */
const toggleFullImage = async (photoUrl) => {
  $('.full-image__image-container').toggle();
  
  const targetDivIdToRender = '.full-image__image-container';
  $(targetDivIdToRender).empty();
  const html = `
    <span class='close'>&times;</span>
    <img src='${photoUrl}' alt='full image'/>
  `;
  
  $(targetDivIdToRender).append(html);
} 

/**
 * Switch between Catalog & Favorites Tabs
 *
 * @param {event} evt contains the event type
 * @param {string} tabName is the title of tab to show
 */
const openTab = (evt, tabName) => {
  let i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("content__tabcontent");

  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  tablinks = document.getElementsByClassName("main-menu__tablinks");
  
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";

  checkIfFavorites();
}
  
/**
 * Checks whether Favorites tab is opened and triggers fav images loading
 */
const checkIfFavorites = async () => {
  // If tab Favorites is not active, don't render images
  if($('#favorites').css('display') !== 'block' ) {
    return
  } else {
    renderFavoritesImages();
  }
}

/**
 * Renders favorite images
 */
const renderFavoritesImages = async () => {
  // Get all saved photos' ids
  for(let i = 0; i < localStorage.length; i++) {
    const id = localStorage.key(i);
    const photos = await getAlbumContent(localStorage.getItem(id));

    photos?.map(photo => {
      // Match photo id's from full album and saved in localStorage
      if(photo.id !== parseInt(id)) {
        return
      }

      // if img node with the given id does exist, prevent its double rendering
      const isImageExists = document.getElementById('img-fav-' + photo.id);

      if(isImageExists) { 
        return
      }
      
      // ...else render an image
      let html = `
        <div class='album-photo'>
          <div class="album-photo__photo-container">
            <div class="album-photo__img-container">
              <div class="album-photo__star">
                <i class="fas fa-star selected" id="star-${photo.id}"></i>
              </div>
              <div class='album-photo__thumbnail'>
                <img src="${photo.thumbnailUrl}" id='img-fav-${photo.id}'>
                <div>${photo.title}</div>
              </div>
            </div>
          </div>
        </div>
      `;

      $("#favorites").append(html);

      // add event listener to show full image
      const targetImageId = `#img-fav-${photo.id}`;
      $(targetImageId).click(function() {
        toggleFullImage(photo.url);
      }); 
      
      // ...or to remove from favorites
      const starId = `#star-${photo.id}`;
      const catalogStarId = `#star-id-${photo.id}`;

      $(document).on('click', starId, function(event){
        const fullId = event.target.id;
        const digitId = fullId.match(/(\d+)/);
        const starId = '#star-' + digitId[0];
        $(starId).parents().eq(2).remove(); // remove img from favorites' DOM
        localStorage.removeItem(digitId[0]);
        $(catalogStarId).removeClass('selected'); // unmark star from catalog
      });
    });
  }
}
 

/**
 * Fetch album's content
 *
 * @param {string} albumId target album id to load
 * @return {JSON} JSON array of album's content
 */
const getAlbumContent = async (albumId) => {
  try {
    const url = 'https://json.medrating.org/photos?albumId=' + albumId;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (e) {
    console.error('Failed to get album content');
  }
}

/**
 * Fetch user's albums
 *
 * @param {string} userId target user's id to load
 * @return {JSON} JSON array of user's albums
 */
const getUserAlbums = async (userId) => {
  try {
    const url = 'https://json.medrating.org/albums?userId=' + userId;
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (e) {
    console.error('Failed to fetch users albums');
  }
}

/**
 * Fetch user list
 * 
 * @return {JSON} JSON array of users' objects
 */
const getUserList = async () => {
  try {
    const response = await fetch('https://json.medrating.org/users/');
    const data = await response.json();
    return data
  } catch (e) {
    console.error('Failed to get user list.');
  }
}

$('.full-image__image-container').click( function(){
  $('.full-image__image-container').toggle();
});

// initial point
getUserList().then(userList => {
  renderUserList(userList);
});