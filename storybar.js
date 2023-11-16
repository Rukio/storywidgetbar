const storyWidgetInit = (className) => {
    const storyWidget = document.querySelector(className)
    if (!storyWidget) {
        console.error('Cannot find the defined container selector for the story widget')
        return
    }
    const storyUgcsContainer = storyWidget.querySelector('.story-list')
    const storyUgcs = storyWidget.querySelectorAll('.story-list__item')
    const storyModalItems = storyWidget.querySelectorAll('.story-modal__item')
    const storyModalWrapper = storyWidget.querySelector('.story-modal__wrapper')
    const storyModalClose = storyWidget.querySelector('.story-modal-close')
    const storyModalImgs = storyWidget.querySelectorAll('.story-modal-img')
    const storyModalList = storyWidget.querySelector('.story-modal-list')
    const storyProgressThumb = storyWidget.querySelector('.story-modal-progressbar__item')
    const storyModalPurchaseButtons = storyWidget.querySelectorAll('.story-modal-purchase')
    const storyModalProductsWrappers = storyWidget.querySelectorAll('.story-modal-products__wrapper')
    const autoplayDuration = 4000
    let lastDirection = -1
    let storyAutoplayInterval = null
    let storyModalItemsLength = storyModalImgs.length
    let storyCurrentSlide = 0
    let storyLastTouchDownX = 0
    let storyLastTouchDownY = 0
    let storySlideIsDown = false
    let storyUgcsMoved = false
    let storyUgcsIsDown = false
    let storySwipeMin = 40
    let storyUgcsStartX
    let storyUgcsScrollLeft

    const touchDown = (e) => {
        storyLastTouchDownX = getTouchX(e)
        storyLastTouchDownY = getTouchY(e)
        storySlideIsDown = true
        storyStopAutoplay()
    }

    const touchUp = (e) => {
        e.preventDefault()
        if (e.target.classList.contains('story-modal-img__item') && storySlideIsDown) {
            let slideDir
            if (storyLastTouchDownX == getTouchX(e) && storyLastTouchDownY == getTouchY(e)) {
                slideDir = 'next'
            } else {
                if (Math.abs(storyLastTouchDownX - getTouchX(e)) < storySwipeMin) {
                    return
                }
                slideDir = storyLastTouchDownX < getTouchX(e) ? 'prev' : 'next'
            }
            storySlideSwitch(slideDir)
            storyLaunchAutoplay(autoplayDuration)
        }
        storySlideIsDown = false
    }

    const getTouchX = (e) => {
        return e.changedTouches ? e.changedTouches[0].clientX : e.clientX
    }

    const getTouchY = (e) => {
        return e.changedTouches ? e.changedTouches[0].clientY : e.clientY
    }

    const rebaseItems = () => {
        if (lastDirection === -1) {
            storyModalList.appendChild(storyModalList.firstElementChild)
        } else if (lastDirection === 1) {
            storyModalList.prepend(storyModalList.lastElementChild)
        }
        storyModalList.style.transition = 'none'
        storyModalList.style.transform = 'translate(0)'
        setTimeout(() => { storyModalList.style.transition = 'transform 0.3s ease' })
    }

    const storySlideSwitch = (type, isInstant) => {
        const modalListWidth = storyModalList.clientWidth
        if (isInstant) {
            storyModalList.style.transition = 'none'
        } else {
            storyModalList.style.transition = 'transform .3s ease'
        }
        if (type === 'next') {
            if (storyCurrentSlide === storyModalItemsLength - 1) {
                storyCurrentSlide = 0
            } else {
                storyCurrentSlide++
            }
            if (lastDirection === 1) {
                storyModalList.prepend(storyModalList.lastElementChild)
                lastDirection = -1
            }
            // storyModalList.prepend(storyModalList.lastElementChild)
            storyModalList.style.justifyContent = 'flex-start'
            storyModalList.style.transform = 'translateX(-100%)'
            storyInitProgressbar()
        } else if (type === 'prev') {
            if (storyCurrentSlide > 0) {
                storyCurrentSlide--
            } else {
                storyCurrentSlide = storyModalItemsLength - 1
            }
            if (lastDirection === -1) {
                storyModalList.appendChild(storyModalList.firstElementChild)
                lastDirection = 1
            }
            storyModalList.style.justifyContent = 'flex-end'
            storyModalList.style.transform = 'translateX(100%)'
            storyInitProgressbar()
        } else if (typeof type === 'number') {
            if (storyCurrentSlide < storyModalItemsLength - 1 || storyCurrentSlide >= 0) {
                storyCurrentSlide = type
                if (lastDirection === 1) {
                    lastDirection = -1
                }
                storyModalItems.forEach((item, i) => {
                    if (item.getAttribute('data-key') == type) {
                        foundFirst = true
                        storyModalList.prepend(item)
                        let resortedResult = []
                        let itemsNoCurrent = [...storyModalItems].filter(item => {
                            if (item.getAttribute('data-key') != type) {
                                storyModalList.removeChild(item)
                            }
                            return item.getAttribute('data-key') != type
                        })
                        itemsNoCurrent = itemsNoCurrent
                            .sort((a, b) => {
                                a.getAttribute('data-key') - b.getAttribute('data-key')
                            })
                        let itemsKeyLessCurrent = itemsNoCurrent.filter(itemI => itemI.getAttribute('data-key') < type)
                        let itemsKeyBiggerCurrent = itemsNoCurrent.filter(itemI => itemI.getAttribute('data-key') > type)
                        itemsKeyBiggerCurrent.forEach(itemI => {
                            storyModalList.append(itemI)
                        })
                        itemsKeyLessCurrent.forEach(itemI => {
                            storyModalList.append(itemI)
                        })
                    }
                })
                storyModalList.style.justifyContent = 'flex-start'
                storyModalList.style.transform = 'translateX(0)'
                storyInitProgressbar()
            }
        }
    }

    const storyLaunchAutoplay = (duration) => {
        clearInterval(storyAutoplayInterval)
        storyAutoplayInterval = setInterval(() => {
            storySlideSwitch('next')
        }, duration)
    }

    const storyStopAutoplay = () => {
        clearInterval(storyAutoplayInterval)
    }

    const storyInitProgressbar = () => {
        storyProgressThumb.setAttribute('style', '');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                storyProgressThumb.setAttribute('style', `transition-duration: ${autoplayDuration}ms`);
                storyProgressThumb.style.transform = `scaleX(1)`
            })
        })
    }

    const storyCloseModal = () => {
        storyModalWrapper.classList.remove('story-modal__wrapper_active')
        clearInterval(storyAutoplayInterval)
        hideProducts(null, true)
    }

    const hideProducts = (wrapper, all) => {
        if (!all) {
            wrapper.style.display = ''
        } else {
            storyModalProductsWrappers.forEach(item => item.style.display = '')
        }
    }

    const showProducts = (wrapper) => {
        wrapper.style.display = 'flex'
    }

    const storyUgcsTouchUp = () => {
        storyUgcsIsDown = false
        storyUgcsContainer.classList.remove('active')
    }

    const storyUgcsTouchDown = (e) => {
        const pageX = e.changedTouches ? e.changedTouches[0].pageX : e.pageX
        storyUgcsIsDown = true
        storyUgcsMoved = false
        storyUgcsContainer.classList.add('active')
        storyUgcsStartX = pageX - storyUgcsContainer.offsetLeft
        storyUgcsScrollLeft = storyUgcsContainer.scrollLeft
    }

    const storyUgcsTouchMove = (e) => {
        if (!storyUgcsIsDown) return
        storyUgcsMoved = true
        e.preventDefault()
        const pageX = e.changedTouches ? e.changedTouches[0].pageX : e.pageX
        const x = pageX - storyUgcsContainer.offsetLeft
        const walk = (x - storyUgcsStartX) * 2
        storyUgcsContainer.scrollLeft = storyUgcsScrollLeft - walk
    }

    storyUgcsContainer.addEventListener('mousedown', storyUgcsTouchDown)
    storyUgcsContainer.addEventListener('touchstart', storyUgcsTouchDown)
    storyUgcsContainer.addEventListener('mouseleave', storyUgcsTouchUp)
    storyUgcsContainer.addEventListener('mouseup', storyUgcsTouchUp)
    storyUgcsContainer.addEventListener('touchend', storyUgcsTouchUp)
    storyUgcsContainer.addEventListener('mousemove', storyUgcsTouchMove)
    storyUgcsContainer.addEventListener('touchmove', storyUgcsTouchMove)

    storyModalList.addEventListener('transitionend', rebaseItems)

    storyModalList.style.transform = 'translateX(0px)'

    storyUgcs.forEach((item, i) => {
        item.addEventListener('click', () => {
            if (storyUgcsMoved) {
                storyUgcsMoved = false
                return
            }
            storySlideSwitch(i, true)
            storyModalWrapper.classList.add('story-modal__wrapper_active')
            storyLaunchAutoplay(autoplayDuration)
        })
    })

    storyModalImgs.forEach(item => {
        item.querySelector('.story-modal-img__item').setAttribute('draggable', false)
        item.querySelector('.story-modal-img__item').addEventListener('dragstart', (e) => {
            e.preventDefault()
        })
        item.addEventListener('mousedown', touchDown)
        item.addEventListener('touchstart', touchDown)
        item.addEventListener('mouseup', touchUp)
        item.addEventListener('touchend', touchUp)
        item.addEventListener('mouseleave', () => {
            storySlideIsDown = false
        })
    })

    storyModalPurchaseButtons.forEach((item, i) => {
        item.addEventListener('click', () => {
            storyStopAutoplay()
            showProducts(item.nextSibling.nextSibling)
        })
    })

    storyModalProductsWrappers.forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.classList.contains('story-modal-products__wrapper')) {
                e.stopImmediatePropagation()
                hideProducts(e.target)
                storySlideSwitch('next')
                storyLaunchAutoplay(autoplayDuration)
            }
        })
    })

    storyModalClose.addEventListener('click', () => {
        storyCloseModal()
    })

    console.log('Story widget loaded')
}