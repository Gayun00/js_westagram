import { Html } from './html.js';

const $search = document.querySelector('.search');
const $topStoryWrap = document.querySelector('.top-story__wrap');
const $feeds = document.querySelector('.feeds');
const $myButton = document.querySelector('.my');
const $searchResultContainer = document.querySelector('.search__result--container');
const $searchResultWrap = document.querySelector('.search__result--wrap');

const idArr = [["images/profile-img2.jpg", 'wecbsdfp', 'account | clkdj'], ["images/profile-img.jpg", 'i_love_coding', '아코딩'], [null, 'sunglass', null], [null, 'sweat_shirt', null], [null, 'newziland4043', null], [null, 'huggy_woggy__33', null]];

$search.addEventListener('keyup', searchId);
document.addEventListener('click', handleMyMenu);

const myId = 'canon_mj';

let feedData = [];
let storyData = [];

async function fetchData() {
    feedData = await(await fetch('data/feed.json')).json();
    await loading();
    storyData = await(await fetch('data/story.json')).json();
    await addTopStory(storyData);
}

fetchData()

let displayCount = 0;

const html = new Html();

function addTopStory(data) {
    $topStoryWrap.innerHTML = html.addTopStory(data);

}

function addComment(e) {
    e.preventDefault();
    const target = e.target;
    const $commentInput = target.previousSibling.previousSibling;
    const $commentContainer = $commentInput.parentNode.previousSibling.previousSibling;
    const newCommentEl = document.createElement('ul');
    newCommentEl.classList.add('comment');
    newCommentEl.innerHTML = html.writeComment(myId, $commentInput.value)
    $commentContainer.appendChild(newCommentEl);
    $commentInput.value = '';
}

function deleteComment(e) {
    const target = e.target;
    if(target.className !== 'fas fa-times') return;
    const commentItem = target.parentNode.parentNode;
    const $commentContainer = commentItem.parentNode;
    $commentContainer.removeChild(commentItem);
}

function handleLike(e) {
    const target = e.target;
    const $likeComment = target.parentNode.parentNode.parentNode.nextSibling.nextSibling.childNodes[2].nextSibling;
    const feedNumber = $likeComment.dataset.num;
    const likeList = feedData[feedNumber].likesCount;

    target.classList.toggle('far');
    target.classList.toggle('fas');
    target.classList.toggle('liked');

    if(target.classList.contains('liked')) {
        $likeComment.textContent = `${likeList[0]}님 외 ${likeList.length + 1}명이 좋아합니다.`
    } else {
        $likeComment.textContent = `${likeList[0]}님 외 ${likeList.length}명이 좋아합니다.`
    }
}

function searchId(e) {
    const target = e.target;
    if(target.value.length > 0) {
        $searchResultWrap.classList.remove('hide');
    } else {
        $searchResultWrap.classList.add('hide');
    }
    $searchResultContainer.innerHTML = html.searchResult(target.value, idArr)
}

function handleMyMenu(e) {
    const target = e.target;
    if(target.id === 'my__img') {
        $myButton.classList.toggle('hide');
    } else {
        $myButton.classList.add('hide');
    }
}
let nextFeedCheckIndex = 0;
const skeletonHtml = html.addSkeleton();
const $feedEnd = document.querySelector('.feed__end');

const callback = (entry, observer) => {
    if(entry[0].isIntersecting && entry[0].intersectionRatio === 1) {
        nextFeedCheckIndex++;
        if(nextFeedCheckIndex < feedData.length) {
            loading();

        } else {
            displayNoFeedMessage();
        }
    }
}

let options = {
    root: null,
    rootMargin: '0px',
    threshold: 1,
  }

const observer = new IntersectionObserver(callback, options)
observer.observe($feedEnd);

function loading() {
    const $newFeed = document.createElement('article');
    $newFeed.classList.add('skeleton');
    $newFeed.innerHTML = skeletonHtml;
    $feeds.appendChild($newFeed);

    setTimeout(() => {
        displayFeed($newFeed);
    }, 1000)
}

function handleEvent(e) {
    const target = e.target.className;
    if(target === 'fas fa-times') {
        deleteComment(e);
    } else if(target === 'comment__input--button') {
        addComment(e);
    } else if(target.includes('fa-heart')) {
        handleLike(e);
    }
}

function displayFeed(feedEl) {
    const index = displayCount++;
    const data = feedData[index];
    feedEl.classList.remove('skeleton');
    feedEl.addEventListener('click', handleEvent);

        feedEl.classList.add('feed');
        feedEl.innerHTML = html.addFeed(data, index);
}

function displayNoFeedMessage() {
    const $noFeedEl = document.createElement('article');
    $noFeedEl.classList.add('noFeedContainer');
    $noFeedEl.innerHTML = html.handleNoFeed();
    $feeds.appendChild($noFeedEl);
    observer.unobserve($feedEnd);
}
