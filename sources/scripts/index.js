document.addEventListener('DOMContentLoaded', function () {
    // Foldable device detection and handling
    function handleFoldableDevice() {
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const viewportWidth = window.innerWidth;
        const aspectRatio = screenWidth / screenHeight;
        
        // Detect Samsung Z Fold and similar devices
        const isFoldable = (
            // Samsung Z Fold 4/5 dimensions (unfolded: ~2176x1812, folded: ~904x2176)
            (screenWidth > 2000 && screenHeight > 1800) ||
            // Very wide aspect ratio suggests foldable unfolded
            (aspectRatio > 1.8 && viewportWidth > 1000) ||
            // CSS Foldable API detection
            ('screen' in window && 'fold' in screen)
        );
        
        if (isFoldable) {
            document.body.classList.add('foldable-device');
            console.log('Foldable device detected');
        } else {
            document.body.classList.remove('foldable-device');
        }
        
        // Trigger layout updates for testimony cards when fold state changes
        if (typeof allocateCardWidths === 'function') {
            setTimeout(() => {
                allocateCardWidths();
                if (typeof matchPairHeights === 'function') {
                    setTimeout(matchPairHeights, 100);
                }
            }, 200);
        }
        
        // Handle viewport changes (fold/unfold events)
        if ('screen' in window && 'addEventListener' in screen) {
            screen.addEventListener('change', handleFoldableDevice);
        }
        
        // Also listen for resize events with debouncing
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                handleFoldableDevice();
                // Also trigger testimony card updates on any resize
                if (typeof allocateCardWidths === 'function') {
                    allocateCardWidths();
                    setTimeout(() => {
                        if (typeof matchPairHeights === 'function') {
                            matchPairHeights();
                        }
                    }, 100);
                }
            }, 250);
        });
    }
    
    // Initialize foldable detection
    handleFoldableDevice();

    // Low bandwidth optimizations
    function initLowBandwidthOptimizations() {
        // Detect slow connection
        let isSlowConnection = false;
        
        if ('connection' in navigator) {
            const connection = navigator.connection;
            // Consider 2G, slow-2g, or effective type 'slow-2g' as slow
            isSlowConnection = connection.effectiveType === 'slow-2g' || 
                              connection.effectiveType === '2g' ||
                              connection.downlink < 1.5; // Less than 1.5 Mbps
            
            console.log('Connection detected:', {
                effectiveType: connection.effectiveType,
                downlink: connection.downlink,
                isSlowConnection: isSlowConnection
            });
        }
        
        // Add low bandwidth class for styling
        if (isSlowConnection) {
            document.body.classList.add('low-bandwidth');
        }
        
        // Implement lazy loading for images
        function implementLazyLoading() {
            const images = document.querySelectorAll('img:not([data-lazy-loaded])');
            
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        
                        // Store original src if not already done
                        if (!img.dataset.originalSrc && img.src) {
                            img.dataset.originalSrc = img.src;
                        }
                        
                        // Load image
                        if (img.dataset.originalSrc) {
                            img.src = img.dataset.originalSrc;
                            img.dataset.lazyLoaded = 'true';
                        }
                        
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px' // Start loading 50px before image enters viewport
            });
            
            // Setup lazy loading for all images
            images.forEach(img => {
                // Move src to data attribute for lazy loading
                if (img.src && !img.dataset.originalSrc) {
                    img.dataset.originalSrc = img.src;
                    img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMSIgaGVpZ2h0PSIxIiB2aWV3Qm94PSIwIDAgMSAxIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNmNWY1ZjUiLz48L3N2Zz4=';
                }
                imageObserver.observe(img);
            });
        }
        
        // Critical images (above fold) should load immediately
        function loadCriticalImages() {
            const criticalImages = document.querySelectorAll('.intro-img, .testimony-photo:first-child, [data-critical="true"]');
            criticalImages.forEach(img => {
                if (img.dataset.originalSrc) {
                    img.src = img.dataset.originalSrc;
                    img.dataset.lazyLoaded = 'true';
                }
            });
        }
        
        // Initialize optimizations
        if (isSlowConnection) {
            implementLazyLoading();
            
            // Delay non-critical features
            setTimeout(() => {
                loadCriticalImages();
            }, 1000);
        } else {
            // Normal connection - load critical images immediately
            loadCriticalImages();
            
            // Still implement lazy loading for off-screen images
            setTimeout(implementLazyLoading, 100);
        }
        
        // Preload next page on hover (for fast connections only)
        if (!isSlowConnection) {
            document.querySelectorAll('.section-nav-link').forEach(link => {
                link.addEventListener('mouseenter', function() {
                    const href = this.getAttribute('href');
                    if (href && !href.startsWith('#')) {
                        const linkElement = document.createElement('link');
                        linkElement.rel = 'prefetch';
                        linkElement.href = href;
                        document.head.appendChild(linkElement);
                    }
                }, { once: true });
            });
        }
    }
    
    // Initialize low bandwidth optimizations
    initLowBandwidthOptimizations();
    
    // Register Service Worker for offline support and caching
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('Service Worker registered successfully:', registration.scope);
                })
                .catch((error) => {
                    console.log('Service Worker registration failed:', error);
                });
        });
    }

    // Mobile back button handler for modals
    let modalHistoryState = false;
    
    function setupModalBackHandler() {
        // Track when modals are opened/closed
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                    const target = mutation.target;
                    
                    // Check if this is a modal element
                    if (target.classList.contains('testimony-modal') || 
                        target.classList.contains('img-modal') ||
                        target.id === 'testimonyModal' ||
                        target.id === 'imgModal') {
                        
                        if (target.classList.contains('active')) {
                            // Modal opened - add history state
                            if (!modalHistoryState) {
                                history.pushState({ modal: true }, '', '');
                                modalHistoryState = true;
                            }
                        } else {
                            // Modal closed - remove history state if it was added by modal
                            if (modalHistoryState) {
                                modalHistoryState = false;
                            }
                        }
                    }
                }
            });
        });
        
        // Observe all potential modal elements
        const modals = document.querySelectorAll('.testimony-modal, .img-modal, #testimonyModal, #imgModal');
        modals.forEach(modal => {
            if (modal) {
                observer.observe(modal, { attributes: true, attributeFilter: ['class'] });
            }
        });
        
        // Handle back button presses
        window.addEventListener('popstate', function(event) {
            if (event.state && event.state.modal) {
                // This was a modal history state, don't do anything special
                return;
            }
            
            // Check if any modal is currently open
            const openModals = document.querySelectorAll('.testimony-modal.active, .img-modal.active, #testimonyModal.active, #imgModal.active');
            
            if (openModals.length > 0) {
                // Close all open modals
                openModals.forEach(modal => {
                    modal.classList.remove('active');
                });
                
                // Prevent default back navigation
                history.pushState({ modal: false }, '', '');
                modalHistoryState = false;
                
                // Prevent the default back action
                event.preventDefault();
                return false;
            }
        });
    }
    
    // Initialize modal back handler
    setupModalBackHandler();

    // Add a small delay to ensure all elements are rendered
    setTimeout(function () {
        // Mobile accordion navigation
        function initMobileNavigation() {
            const nav = document.querySelector('nav');
            const navToggle = document.querySelector('.nav-toggle');
            const navArrow = document.querySelector('.nav-arrow');

            console.log('Initializing navigation:', { nav: !!nav, navToggle: !!navToggle, navArrow: !!navArrow });

            if (navToggle && nav) {
                // Set initial collapsed state
                nav.classList.add('collapsed');

                navToggle.addEventListener('click', function (e) {
                    e.preventDefault();
                    e.stopPropagation();

                    if (nav.classList.contains('collapsed')) {
                        nav.classList.remove('collapsed');
                        nav.classList.add('expanded');
                        if (navArrow) navArrow.classList.add('down');
                    } else {
                        nav.classList.remove('expanded');
                        nav.classList.add('collapsed');
                        if (navArrow) navArrow.classList.remove('down');
                    }
                });

                // Close when clicking outside
                document.addEventListener('click', function (e) {
                    if (!nav.contains(e.target)) {
                        nav.classList.remove('expanded');
                        nav.classList.add('collapsed');
                        if (navArrow) navArrow.classList.remove('down');
                    }
                });

                // Close when clicking on a navigation link
                const navLinks = document.querySelectorAll('.nav-menu a');
                navLinks.forEach(link => {
                    link.addEventListener('click', function () {
                        nav.classList.remove('expanded');
                        nav.classList.add('collapsed');
                        if (navArrow) navArrow.classList.remove('down');
                    });
                });
            }
        }

        // Initialize mobile navigation
        initMobileNavigation();

        // Pair-based width allocation for testimony cards
        function allocateCardWidths() {
            const testimonyCards = document.querySelectorAll('.testimony-card');
            if (testimonyCards.length === 0) return;

            // Remove existing width classes
            testimonyCards.forEach(card => {
                card.classList.remove('width-2', 'width-3', 'width-4', 'width-5', 'width-6');
            });

            // Process cards in pairs
            for (let i = 0; i < testimonyCards.length; i += 2) {
                const card1 = testimonyCards[i];
                const card2 = testimonyCards[i + 1];

                // Get character counts
                const quote1Element = card1.querySelector('.testimony-quote');
                const quote1Text = quote1Element ? quote1Element.textContent.trim() : '';
                const quote1CharCount = quote1Text ? quote1Text.length : 100;

                if (card2) {
                    // Pair of cards - distribute width based on character count ratio
                    const quote2Element = card2.querySelector('.testimony-quote');
                    const quote2Text = quote2Element ? quote2Element.textContent.trim() : '';
                    const quote2CharCount = quote2Text ? quote2Text.length : 100;

                    const totalChars = quote1CharCount + quote2CharCount;
                    const ratio1 = quote1CharCount / totalChars;
                    const ratio2 = quote2CharCount / totalChars;

                    // Convert ratios to 8-column widths, ensuring minimum of 3 and maximum of 5
                    let width1 = Math.round(ratio1 * 8);
                    let width2 = Math.round(ratio2 * 8);

                    // Ensure widths are within bounds and sum to 8
                    width1 = Math.max(3, Math.min(5, width1));
                    width2 = 8 - width1;
                    width2 = Math.max(3, Math.min(5, width2));

                    // If adjustment made width2 invalid, readjust width1
                    if (width1 + width2 !== 8) {
                        width1 = 8 - width2;
                    }

                    card1.classList.add(`width-${width1}`);
                    card2.classList.add(`width-${width2}`);
                } else {
                    // Odd card at the end - give it medium width (4 columns = half width)
                    card1.classList.add('width-4');
                }
            }
        }

        // Match heights for testimony card pairs
        function matchPairHeights() {
            const testimonyCards = document.querySelectorAll('.testimony-card');
            if (testimonyCards.length === 0) return;

            // Reset heights first
            testimonyCards.forEach(card => {
                card.style.height = 'auto';
            });

            // Process cards in pairs to match heights
            for (let i = 0; i < testimonyCards.length; i += 2) {
                const card1 = testimonyCards[i];
                const card2 = testimonyCards[i + 1];

                if (card2) {
                    // Wait for next frame to ensure content is rendered
                    requestAnimationFrame(() => {
                        const height1 = card1.offsetHeight;
                        const height2 = card2.offsetHeight;
                        const maxHeight = Math.max(height1, height2);

                        card1.style.height = `${maxHeight}px`;
                        card2.style.height = `${maxHeight}px`;
                    });
                }
            }
        }

        // Initialize smart width allocation and height matching
        allocateCardWidths();

        // Match heights after width allocation is complete
        setTimeout(() => {
            matchPairHeights();
        }, 100);

        // Re-match heights on window resize
        let testimonyResizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(testimonyResizeTimeout);
            testimonyResizeTimeout = setTimeout(() => {
                // Reallocate widths and heights for responsive changes (including foldables)
                allocateCardWidths();
                setTimeout(() => {
                    matchPairHeights();
                }, 100);
            }, 250);
        });

        // Navbar active section tracker
        const navLinks = document.querySelectorAll('nav a');
        const sections = Array.from(navLinks).map(link => {
            const id = link.getAttribute('href').replace('#', '');
            return document.getElementById(id);
        });

        // Testimony modal logic
        const testimonies = [
            {
                name: "Eld Eliezer Ortega",
                photos: [
                    ["sources/eliezer.jpg", "Mission team with brethren from GBPC (Bogo and San Antonio)"],
                    ["sources/eliezer-2.jpg", "Elder Mah ministering God’s Word at the combined Prayer meeting of GBPC (Bogo and San Antonio)"]
                ],
                quote: "...the Mission Team had walked through the mud like a farmer who would not be deterred to nurture and cultivate the crops.",
                body: `Greetings to all in the blessed name of our Lord & Saviour Jesus Christ!<br/>
Blessed be the name of the LORD, who is the God full of grace and mercy, the God of Providence and supremely Sovereign over all His creation and events.<br/>
The Lord be praised for the recent mission trip of the Mission Team from our mother church headed by Eld Mah. All glory be unto the Lord for the presence of the Mission Team in our midst. It was such a great blessing to us and the brethren from the 2 mission churches of Bogo and San Antonio. The Lord truly has His way of expressing His love to the brethren from the mission churches of Bogo and San Antonio. Through the messages preached in each of the homes and the practical expression of love through the giving of groceries to each family visited, the brethren had truly felt the warmth, love and affection of the Lord. And they are very much thankful to the Lord for the blessings they had received. Notwithstanding the muddy pathway towards many of the homes of the brethren, the Mission Team had walked through the mud like a farmer who would not be deterred to nurture and cultivate the crops.<br/>
All praises be unto the Lord also of how He has providentially allowed the Mission Team to minister to the whole campus of Cebu Roosevelt Memorial Colleges High School Campus consisting of over 900 students and faculties. The Lord indeed works in a mysterious way. The initial plan for the school was to conduct an evangelism and give out Gospel tracts inside the campus. As we asked permission from the authorities for such, lo and behold a great door of opportunity was opened for us. The school has given us the time to minister to them. What was envisioned as giving out of tracts to the students, turned out to be a Gospel Rally for the whole campus. Praise the Lord for His providence!<br/>
Even on the eve of the Gospel Rally, the Lord has providentially led the Mission Team in the preparation for the give-aways for the students and faculty. The men of the Mission Team were about to go to the home of the next family for visitation in the afternoon of the eve of the Gospel Rally. But a heavy downpour has prevented us from going to the family for visitation because it will be very difficult to go to their place which is situated some distance from the road and the thick mud which would meet the Mission Team on the way to their home. This has led the men of the Mission Team to go back to Bogo church and lo, a tremendous work of preparation for the give-aways awaited. With the willing and able help of the men, the preparations were done just in the nick of time, ready for the last home for visitation and for tomorrow’s Gospel Meeting. Indeed, the Lord is the God of Providence.<br/>
Once again, I give all glory and honour to the Lord God Almighty who daily loadeth us with benefits. With all the workings that the Lord has been pleased to work out providentially in our midst, a great challenge lies ahead for the missionary-in-charge and the brethren from the mission churches of Bogo and San Antonio. With His providential dealings during the Mission Team’s visit, this would be our anchor for His continued work of Providence amongst us. Please uphold us in prayer that we may be steadfast, unmoveable, always abounding in the work of the Lord, for the harvest truly is plenteous but the labourers are few. Praise be unto the Lord for the brethren of the Mission Team whom the Lord providentially used for our encouragement and example.
`
            },
            {
                name: "Dns Diana Chan",
                photos: [
                    ["sources/dnsdiana1.jpg", "Pastor Koshy praying for M25 at Changi Airport"],
                    ["sources/dnsDiana2.jpg", "Praying with the sisters from San Antonio and Bogo churches"],
                    ["sources/dnsDiana3.jpg", "Official closing of M25 with a combined Prayer meeting with Cebu City brethren"]
                ],
                quote: "May the Lord, in His grace, grant these children salvation and even call some to serve Him in His harvest.",
                body: `My heart is filled with awe and reverence for the Lord, and my soul sings, “How great Thou art!” I thank God for His grace in enabling a team of twenty-three brethren to serve in M25 Cebu, from 5–10 August 2025, under the leadership of Eld Mah, Dn Gan and Bro Edward.
</br>The Lord has been so good to us. I thank God for all of you, dear brethren, for your prayers, well-wishes, love gifts, and manifold support for M25.
</br>I also thank God for Pastor Koshy and Bro Johnny Rey, who encouraged us with their presence at Changi Airport early in the morning and prayed for us before we departed. Upon our arrival at Mactan Airport in Cebu, we were warmly welcomed by the local brethren. We thank God for the thoughtful gift of a “farmer’s hat” from Rev Reggor, given to each of us, which brought much cheer to the team.<br/>
</br>Praise the Lord that we began our M25 journey with a combined Bogo and San Antonio Prayer Meeting. I thank God for the blessed opportunity to pray alongside four sisters from the San Antonio and Bogo Churches.
</br>By the grace of God, our brothers and sisters were enabled to teach and share the Word of God in the Children’s Ministry at Bogo Church, San Antonio Church, Cebu City Church, and also in the home of Sis Ophelia, the mother of Sis Sheryl. Praise the Lord for the overall attendance of 160 children across the three cities. May the Lord, in His grace, grant these children salvation and even call some to serve Him in His harvest. I thank God for our brothers and sisters who served with readiness, adapted swiftly to changes, and laboured with unity and joy as a team.
</br>We witnessed the providence of God in the timely completion of the renovation of the auditorium, which made it possible for more than 900 students and staff from CRMC High School to gather to hear the preaching of the gospel, the sharing of testimonies, and songs of thanksgiving presented by our brethren. Truly, the Lord is great!
</br>When our mission team arrived at Cebu City Church, our hearts were filled with unspeakable joy as we beheld Rev Reggor standing cheerfully from a distance to welcome us. Praise the Lord!
</br>I thank God also for the TGCM visitation. It was truly encouraging to serve alongside the TGCM brothers, who joined us the next day in assisting with the Children’s Outreach at Sis Ophelia’s home. Praise God for Sis Ophelia and her love for the Lord in opening her home for the M25 outreach programmes. May God continue to bless her with His abundant grace and strength.
</br>Our visit to the ladies at DOH-TRC (Cebu City) was an eye-opener. In the small group session, six residents of diverse backgrounds shared their struggles. We saw their pain and agony, yet with the Lord’s leading, we were able to guide them to look unto Jesus for salvation and for a new life in Christ.
</br>It was also a joy to worship the Lord on the Lord’s Day with the local brethren, and to join the children in singing the theme song during the Worship Service at Cebu City Church.
</br>By God’s grace, our M25 journey began with the combined Prayer Meeting at Bogo Church, and it ended beautifully with another combined Prayer Meeting with the brethren at Cebu City Church. Truly, “How beautiful upon the mountains are the feet of him that bringeth good tidings” (Isaiah 52:7). And indeed, as it is written in Psalm 93:1, “The LORD reigneth, he is clothed with majesty.” 
</br>All glory and praise be unto God!
`
            },
            {
                name: "Eld & Mrs Alan Choy",
                photos: [
                    ["sources/eldChoy1.jpg", "Children's outreach at San Antonio"],
                    ["sources/eldChoy2.jpg", "Home visit at San Antonio"]
                ],
                quote: "I thank God for the precious opportunity to join the mission team to Cebu.",
                body: `Thank God for moving the hearts of Luan Kheng and myself to sign up for this mission trip the moment it was announced, and for counting us worthy to labour in His vineyard. It was truly a blessed mission trip, led by Elder Mah, Dn Gan, and Bro Edward, who together with Rev Reggor, Eld Eliezer, Bro Allan and later, including Dn Samuel, formed the Central Committee. The trip was very well planned and executed.
</br>We had a wonderful opportunity to share God’s Word with the children, as well as in home fellowships with the local brethren. It was a blessed time of mutual encouragement and fellowship. Some of the brethren there, though possessing little in terms of earthly goods, had joyful smiles upon their faces. In Bogo and San Antonio, some of the brethren lived on the slope of a hill, which could be precarious during heavy downpours as the area was prone to landslides. There were neither concrete paths nor steps for them to escape quickly in the event of danger. It was not easy for us to visit the brethren’s homes because of the steep and muddy terrain. Thank God for Eld Eliezer‘s faithful spiritual oversight of the churches in Bogo and San Antonio.
</br>I was deeply touched by the testimonies I heard for the first time from our brethren. The Lord had seen them through very difficult times, and they could still magnify the name of the Lord for His goodness before all.
</br>I also thank God for enabling us to share the Gospel at the CRMC High School, where approximately 900 students and staff were in attendance. The principal, staff, and students warmly welcomed us. We ministered to them through songs, testimonies, and the preaching of the Gospel message by Pr Samson. The students were very attentive, and I pray that the Lord will convict the hearts of all who heard the message.
</br>We were likewise given the opportunity for Pr Jeremiah to share the Gospel at the DOH-TRC, where over 70 female residents attended the meeting. Breaking up into smaller groups enabled closer interaction and gave them the chance to ask questions, which was most helpful. We pray that the Gospel materials distributed will help them better understand the message of salvation. For those soon to be released, may they attend our mission church in Cebu City.
</br>The Gospel rally at Sis Ophelia’s home was also well attended. Once again, a powerful Gospel message was preached by Pr Samson. Many children came, and we thank God for our sisters who faithfully taught them God’s Word. Let's pray that some might turn to Christ and come to church.
</br>Finally, we thank God for granting us good weather throughout the trip, despite it being the typhoon season. Truly, the Lord was gracious to us all. “I will praise the name of God with a song, and will magnify him with thanksgiving” (Psalm 69:30).
`
            },
            {
                name: "Sis Celine Lee",
                photos: [
                    ["sources/celine1.jpg", "Children’s outreach at Sis Ophelia’s home"]
                ],
                quote: "None of these would have been possible without God Himself opening the doors for us.",
                body: `All glory be to God for enabling the mission team to visit our churches in Bogo, San Antonio, and Cebu City. I thank the Lord for the opportunity to be part of this mission trip, and I would like to share my thanksgiving items.<br/>
1) The Word of God boldly preached<br/>
"The Lord is not slack concerning his promise, as some men count slackness; but is longsuffering to us-ward, not willing that any should perish, but that all should come to repentance." (2 Peter 3:9)<br/>
Truly, the love of God is so deep. I witnessed how our Preachers and Elders boldly preached God's Word, whether during home visitations or at Gospel outreaches, and I thought to myself: the Lord is so good—firstly, in using our Preachers and Elders as instruments to share His Word, and secondly, in ordaining that these groups of people should hear about His love. The backgrounds of those listening varied greatly, from high school students to women undergoing rehabilitation from drug abuse. Yet the Lord is powerful to save. It was a privilege to see some utter the sinner's prayer and call upon God.<br/>
2) The joy of the little children<br/>
Being involved in the children's outreach programmes was a blessing. The children participated joyfully in the singing of songs taught, even though it was not in their native dialect. I am thankful that both the Singaporean and Filipino brethren worked together and adapted quickly to changes, enabling the lessons to be taught effectively to the children.<br/>
3) The warmth and love of the brethren<br/>
From the moment we arrived until the time we bid farewell at the airport, we were warmly cared for and joyfully received. "Blessed be the tie that binds." I was reminded that the love of God crosses all boundaries of nationality, and that it is our common love for Christ that unites us. Indeed, every child of God is special and dearly cherished in the sight of our Heavenly Father.
`
            },
            {
                name: "Sis Connie Ng",
                photos: [
                    ["sources/connie1.jpg", "Singing with Cebu City sisters"]
                ],
                quote: "I simply needed to obey and trust in His enabling grace.",
                body: `I thank God for the precious opportunity to join the mission team to Cebu. At first, I hesitated to sign up, as I felt I lacked the skills needed to contribute meaningfully. Yet the Lord reminded me through Hebrews 12:2, "Looking unto Jesus the author and finisher of our faith", that I simply needed to obey and trust in His enabling grace.<br/>
I am grateful and relieved to have been assigned to assist the teachers in the children's ministry. Through this role, I witnessed how God could use even the smallest act of service as part of the greater work of reaching children with the Gospel. It reminded me that humble service, when done out of love for Christ, is precious in His sight. This strengthened my faith, assuring me that God can use my limited abilities to glorify His name. I was also blessed to see the teachers lovingly and faithfully share God's Word with the young children, even though some might not yet fully grasp the stories and lessons taught. This brought to mind the parable of the sower in Luke 8:11: "Now the parable is this: The seed is the word of God." Our responsibility is to sow the seed faithfully, trusting God to give the increase in His perfect time. My prayer is that the seeds planted in these little hearts will take root, grow, and bear eternal fruit.<br/>
During the home visitations, I was greatly encouraged to see how our visits brought comfort and joy through the sharing of God's Word and testimonies by the preachers, elders, and deacons, as well as through our singing of hymns together. Although some of us were meeting these brethren for the first time, there was a clear unity of spirit and a bond formed through the love of Christ.<br/>
The team was also blessed to join the prayer meetings at San Antonio, Bogo, and Cebu City. Praying together deepened our fellowship and gave us a foretaste of the joy we will one day share in heaven—worshipping and communing with our Lord forever.<br/>
We also visited and fellowshipped with the brethren at TGCM (Cebu City). We were encouraged by their steadfast faith despite the challenges they face. Bro Clarke shared and demonstrated his skill in sewing cleaning rags, which is one way the brethren earn their livelihood. This was a humbling reminder that God often provides through simple, diligent labour—equipping His people with skills while keeping them dependent on Him.<br/>
I am also thankful that our team was given the opportunity to conduct an evangelistic outreach to about 900 students and staff of CRMC High School (Bogo), as well as a Gospel outreach to 110 residents and staff at the DOH-TRC (Cebu City). The words of Jesus in Matthew 9:37 came to mind: "The harvest truly is plenteous, but the labourers are few." Through the distribution of the Gospel of John booklets, I learned more deeply how to use this Gospel to share the good news of Christ. I pray that many who received the booklet will read it, be convicted of their need for the Saviour, and come to know and confess Him as their Lord and Saviour.<br/>
I returned from the trip not only thankful for the opportunity to serve, but also renewed in my own walk with the Lord. I am learning to fix my eyes, not on my limitations, but on His limitless power and grace—to study His Word more diligently, and to pray more earnestly for the salvation of souls. All glory be to God.
`
            },
            {
                name: "Bro Christyasto",
                photos: [
                    ["sources/chris1.jpg", "Praying with Cebu City brethren"],
                    ["sources/chris2.jpg", "Practising at TGCM (Cebu City)"]
                ],
                quote: "...that I may treasure every opportunity to grow... and be an encouragement to the people the Lord sends...",
                body: `Glory be to the LORD, my Lord God, the most merciful and gracious, for enabling me to be part of the mission team. It was such a great blessing to witness the lives of God's saints in the Philippines.<br/>
I have been taking my life in Singapore for granted—so much so that, at some point, I lost the desire to be fruitful in the work of the Lord. This lack of zeal caused me not to treasure all the relationships the Lord has so abundantly blessed me with. In a way, perhaps "familiarity breeds contempt" holds some truth, but it should never apply to Christian brotherhood! Meeting old yet new friends (some whom I had not seen for ten years) reminded me of how much I have changed in my walk with the Lord: more matured, yet listless. I praise the Lord for revealing this to me, so that I may pray and once again remind myself to hold dear the people the Lord has led me to.<br/>
Through the preaching of His words over the six-day trip, the Lord challenged me with many questions—some of which revealed why I have been so dispirited. Yet, being constantly reminded of our source of salvation, the Lord Jesus Christ, makes those questions seem so trivial. Before our sovereign God, who knows how to give us an expected end (Jeremiah 29), why do we burden ourselves with the cares of this world? Haven't we been called not to worry about the future (Matthew 6:31–34)? In fact, the Lord has called us to be a royal priesthood (1 Peter 2:9)! How, then, do we live so beggarly in the sight of God? By His mercy, we have so much knowledge, yet our hearts are none the wiser. We would rather live practically than bear a testimony worthy of our Lord.<br/>
I pray that the Lord will help me grow in love toward Him and remember the first love that has grown cold; that I may treasure every opportunity to grow, overcome life's trials, and be an encouragement to the people the Lord sends my way. Grant me wisdom to look only to the Lamb of God, and make me useful for Thy glory, O my Lord! Amen.
`
            },
            {
                name: "Bro Edward Wong",
                photos: [
                    ["sources/edward1.jpg", "Giving the souvenir hat to Sis Ellen Oro at San Antonio"],
                    ["sources/edward2.jpg", "Outside San Antonio Church"]
                ],
                quote: "Having witnessed the mighty hand of God guiding us... I cannot keep silent.",
                body: `When Eld Mah first mentioned a planned short-term mission trip in 2025 to Cebu City, Bogo, and San Antonio to the GEM Committee, I had a desire to join, but was unsure if I could, due to my travels and prior committed engagements in September. At that time, the dates for the mission trip had not been confirmed. Yet God made straight the path, and the trip was fixed for early August—falling neatly between my travels and engagements in July and September. I duly informed Eld Mah of my desire to join, though I was uncertain what role I could take up.
Eld Mah then asked if I would prayerfully consider joining Dn Gan and himself in the planning committee. After committing the matter to God in prayer, I accepted the engagement. In my former church, I had joined a mission trip to Kuching, Sarawak, and had also visited some brethren in the remote interiors outside Kuching. Then, I had only played a supportive role. For M25, however, I was tasked to handle cash management and logistics. For the latter, I believe God has blessed me with a clear mind; but for the former, I have always had it easy, because my beloved wife is the one most meticulous with finance.
I much prefer dealing with digital or electronic cash and dislike handling physical cash. For M25, however, I had to manage several thousands of dollars in physical currency for various payments and love gifts, and account for every cent. This was daunting for me. I recall, once on a family trip, I was entrusted with an envelope of cash. I simply left it in my bag and forgot about it. When we returned home, I had a very memorable “wakeful lullaby” from my dear wife—an experience I will never forget!
I could write a long testimony of how God’s hand moved in mysterious ways, both during the planning for M25 and throughout the trip itself, but I would like to mention just a few.
Job 41:11 – “Who hath prevented me, that I should repay him? whatsoever is under the whole heaven is mine.”
The first matter concerned the purchase of Gospel of John booklets. The M25 Committee initially intended to buy 500 copies for the Bogo High School outreach. However, as the number of students grew to nearly 1,000, we decided to purchase 1,000 copies. Yet we could not find any KJV editions in the Philippines, Malaysia, or Singapore. A quick search revealed two suppliers in the USA, so we resolved to order 2,000 copies instead. A quick computation showed that M25 funds barely covered the cost of the books and expedited shipping. But God moved the hearts of family and team members to give, and we received love gifts exceeding the amount required. The booklets were safely and promptly delivered to GBPC Cebu City, neatly packed in boxes of 500—perfectly fitting our intended distribution of 1,500 to GBPC Bogo and 500 to GBPC Cebu City. There was no need for tedious counting or repacking; we simply transported the right boxes.
The second testimony of God’s goodness concerned a logistics matter. Initially, we had a total baggage allowance of 193 kg, designated for M25 items. Due to late additions, we purchased an extra 15 kg allowance before departure. On 5 August, the day of departure, Dn Gan’s group was 5 kg over—the exact weight of a small box assigned to a sister in his group. Since the extra 15 kg was under my name, I took the small box along with my assigned items. My total was 1 kg over, but the kind Scoot staff member waived the excess, and all items were checked in smoothly, avoiding expensive on-site baggage charges. We also thanked God for the accurate weighing scale at GMC—the weights matched exactly with those at the airport.
The final account serves as another reminder of how God can turn even mistakes to His glory. For some reason, I mistakenly packed a set of children’s illustration charts (meant for Bogo and San Antonio) into a Cebu City box. These were the same charts which Mrs. Mah, through Eld. Mah, had reminded me to ensure were packed. In Bogo, when Dns. Diana could not find them during unpacking, I was certain I had packed them, even describing the coloured packaging. But indeed, they had gone to Cebu City instead. Yet God did not allow my error to hinder His work. The ministry to the children in Bogo and San Antonio went on unhindered. I shared with Dns Diana, “I prayed very hard last night and this morning.” She, with her usual calm assurance, replied, “I am very sure you did. God is good.”
Romans 15:5–7 – “Now the God of patience and consolation grant you to be likeminded one toward another according to Christ Jesus: That ye may with one mind and one mouth glorify God, even the Father of our Lord Jesus Christ. Wherefore receive ye one another, as Christ also received us to the glory of God.”
These verses came alive to me during M25. I saw how true Christian encouragement and receiving one another according to Christ Jesus does not depend on social status or material endowment. I witnessed this especially with two sisters from San Antonio and a brother from Cebu City. Their homes were most rudimentary—one “living room” was simply under a tree—but the joy on their faces as they sang spiritual songs and worshipped God through His Word was deeply moving. I observed how the two sisters mouthed the Bible verses as they were read during sermons—they had God’s Word hidden in their hearts. These same sisters were also most diligent in service. After our home visitations, when the Bogo church premises were left with muddy footprints, they quietly mopped the floors clean. At the CRMC High School, they walked the entire arena, picking up papers and rubbish left behind by the 900 students. Having witnessed the mighty hand of God guiding us in planning, organising, and completing M25, I cannot keep silent.
Luke 19:40 – “And he answered and said unto them, I tell you that, if these should hold their peace, the stones would immediately cry out.”
`
            },
            {
                name: "Dn Gan Chin Hwi",
                photos: [
                    ["sources/gan1.jpg", "The team working together to prepare for CRMC outreach"],
                ],
                quote: "In the end, each of us fit in harmoniously; praise the Lord.",
                body: `I have witnessed and experienced how the Lord worked through each member of the Mission Team to fulfill His will, bringing together faithful labourers to cover every aspect of the mission work—from planning and preparation to execution. The Lord chose us, gave us grace, and prepared and strengthened us for the roles He entrusted to each one of us in the mission, according to His purpose (Romans 12:4–5). In the end, each of us fit in harmoniously; praise the Lord.
By His providence, the Lord opened opportunities for us to reach out to unsaved souls at both CRMC High School  and DOH-TRC (Cebu City) for Women. We thank God for the privilege He gave us to bear witness and to be partakers in sowing the gospel seeds alongside our local brethren in the Bogo, San Antonio and Cebu City churches. These opportunities arose during a challenging period, particularly in light of the circumstances involving Rev. Reggor. Yet, I am persuaded and reminded that we must press on, toiling faithfully as we follow the Lord who goes before us. Surely, He will bless, lead, and guide us, for He alone “is able to do exceeding abundantly above all that we ask or think” (Ephesians 3:20).
May the Lord, in His grace and mercy, continue to use us—especially our local brethren—to water the soil, to care for the seedlings, to reap, and to gather in the sheaves at His appointed time. 
All praise and glory be unto God.
`
            },
            {
                name: "Bro Gideon Lee",
                photos: [
                    ["sources/gideon1.jpg", "Singspiration At CRMC High School (Bogo)"]
                ],
                quote: "There was no place for fear or hesitation. This was the day of salvation for 900.",
                body: `“Bogo needs a Saviour,” Elder Eliezer shared with conviction as we stood in the hotel lobby, prepared as a team to travel to Cebu Roosevelt Memorial College (CRMC) for the gospel meeting. As a man who has laboured faithfully for years in the Bogo region, Eld Eliezer spoke not with despair, but with a particular spiritual clarity — the name of Christ has yet to be known deeply in this land.
Shortly thereafter, his words would echo in my heart as I stood in the assembly hall of CRMC, watching close to 900 students stream in. In just a few minutes, what was once a quiet venue became a packed and rowdy gathering — a powerful but intimidating reminder of the magnitude of the work before us. And yet, in that moment, I felt I could understand a fraction of Eld Eliezer’s burden. There was no place for fear or hesitation. This was the day of salvation for 900.
And indeed, what a day of salvation it was! As Pr Samson proclaimed the Gospel with a booming voice, I could not help but be struck by a vivid comparison — was this what the gospel rallies of John Sung’s day were like? Hundreds listening, captivated under the preaching of the Word, brought to a point of decision: to receive Christ or walk away unchanged. It was truly a sight to behold, and all glory belongs to the King of kings. May Bogo receive the Saviour it needs!
On a personal level, the many opportunities to proclaim the Gospel during this mission trip stirred my own heart. I was reminded that the Great Commission is not only to be carried out abroad, but also at home. Why travel to distant lands to speak of Christ, when here in Singapore multitudes remain equally starved for the truth of the Gospel? May the Lord help me — and each of us — to be faithful witnesses wherever He has placed us. 
`
            },
            {
                name: "Pr & Mrs Jeremiah Sim",
                photos: [
                    ["sources/jere1.jpg", "Preparing for preaching at DOH-TRC"],
                    ["sources/jere2.jpg", "Upper Primary Class of Children’s Outreach at San Antonio"]
                ],
                quote: "It is truly amazing to witness how the Lord Jesus Christ has placed all these plans and works together for the team.",
                body: `Gina and I are very thankful to God for the privilege of being part of M25. Our hearts are filled with thanksgiving and gratitude to God for enabling the leaders, both in Singapore and in the Philippines (Bogo, San Antonio, and Cebu City), for their tireless labour and meticulous planning in organising M25. We also thank God for the many hands that contributed, together with the 22 mission members, and finally the addition of Sis Sheryl, who travelled back from Singapore to Cebu City to co-labour with the team.
In M25, there were two key highlights of Gospel outreaches—one in CRMC High School and the other in the DOH-TRC for Women. At both places, each person received a copy of the booklet, The Gospel of John. It is our prayer that many will take it up to read, and be led to contact or visit the church. We thank God for a student who emailed Eld Eliezer on that very day, saying: “Unfortunately, my friend and I may not be able to visit since we have an entrance exam for a scholarship this Saturday. Hopefully, we can visit sometime when we have the time. Thank you again for the experience last Thursday at CRMC.” Let us pray that this group of students, and many more, will soon visit the churches in Bogo or San Antonio.
There were also three children’s outreaches held at each of the mission stations. It is our prayer that the children will return to church to learn more of our Saviour, Jesus Christ. We thank God for the brethren who were so hospitable and welcomed us into their homes. We pray that our visits would serve to encourage and strengthen them in their spiritual walk.
It is truly amazing to witness how the Lord Jesus Christ has placed all these plans and works together for the team. None of these would have been possible without God Himself opening the doors for us.
Our prayer is that the Word of God may work effectually in the hearts of all who heard the Gospel —that some might be saved, while our Filipino brethren would be encouraged in their faith and continue steadfastly in evangelistic efforts. Truly, “the harvest truly is plenteous” (Matthew 9:37a).
M25 was planned without the team’s prior knowledge that Rev. Reggor and Sis. Arlaine would be unwell during our visit. Yet God, who works in mysterious ways, saw it fit that the team should be there at the appointed time—to direct them in “Looking unto Jesus” (Hebrews 12:2a, the theme of M25), and to provide mutual encouragement, comfort, prayer, and cheer, not only for them but also for the brethren in the three churches at large.
Throughout the six days, we experienced God’s abundant grace and mercies. We were under His protection and kept in His safety. Our faith was strengthened day by day as we awaited Him to accomplish His good work. “For I am not ashamed of the gospel of Christ: for it is the power of God unto salvation to every one that believeth; to the Jew first, and also to the Greek” (Romans 1:16).
`
            },
            {
                name: "Sis Joan Cheah",
                photos: [
                    ["sources/jeremiah.jpg", "Children’s outreach at Bogo"]
                ],
                quote: "Even the smallest seed planted in faith can bear much fruit.",
                body: `I am truly thankful and grateful to God for the precious opportunity to be part of this mission trip to Cebu City, Bogo & San Antonio, Philippines on the 5th to 10th August 2025. From the very first prayer to the final worship closing song, it was clear that the Lord was with me every step of the way.
I witnessed doors opened, hearts stirred, and lives touched — not because of who I am, but because of who He is. His faithfulness, mercy, and grace were evident in every message preached, every outreach conducted, every testimony shared.
I was especially moved by how He united us as one in Christ, led us to witness His mighty hand at work, and reminded me that even the smallest seed planted in faith can bear much fruit. 
Through scripture and song, He encouraged me to keep my eyes on Jesus, to stay faithful in prayer and to serve with joy, even in small things — knowing they are precious in His sight.
Verses like Jeremiah 29:11, Psalm 5:3, and Acts 1:11 reminded me of God’s plans, His presence in prayer, and the blessed hope of Christ’s return. Hymns like “Look to the Lamb of God” and “Yesterday, Today, Forever” refreshed my heart and stirred my spirit to worship continually.
Though the trip has come to an end, the mission continues — and by His grace, may the Lord Jesus Christ draw me closer to Him, shaping into a vessel for His service until the day He calls me home to His eternal rest. 
All glory and honour be to our great Saviour, Jesus Christ.
`
            },
            {
                name: "Eld Lim Ah Sang",
                photos: [
                    ["sources/lim1.jpg", "Encouraging brethren with God’s word at TGCM"]
                ],
                quote: "By the Lord’s gracious providence, He opened the doors to the harvest fields.",
                body: `John 20:21 – “Then said Jesus to them again, Peace be unto you: as my Father hath sent me, even so send I you.”
God moves in His mysterious ways. I had not planned to be part of the Mission Team when I first learned of it. The prompting of the Holy Spirit for me to join came much later, and this was further confirmed when Eld Low asked if I would like to go.
By the Lord’s gracious providence, He opened the doors to the harvest fields. The level of participation was beyond expectation, as He gathered brethren from Cebu City, Bogo, San Antonio, and Singapore to co-labour in this spiritual endeavour, “Looking Unto Jesus”, from 5th–10th August 2025, with its theme song, “Look to the Lamb of God.”
This mission trip was both a steep learning curve and a joyful experience for me, though at times intimidating, as it was my first mission trip to the Philippines and I was tasked with sharing three messages and a personal testimony. Yet the good Lord who sent me knew my many weaknesses, and by His enabling grace, He comforted and strengthened me.
The mission program concluded with a prayer session for the specific needs of Rev Reggor and his family, and for the brethren in Cebu City GBPC. May the all-sufficient grace of God be upon Rev Reggor as he continues his medical treatment, and may God grant strength and wisdom to Sis Caroline as she cares for him and looks after their three children, Ruth, Naomi, and Esther. May the peace of God, which passeth all understanding, rest upon Rev Reggor and his family in this difficult time.
May our faithful God protect Cebu City Church from the wiles of the evil one, and raise up Spirit-filled ministers and preachers to co-labour with Rev Reggor in the ministry of the Word. May the faith of the brethren in Cebu City GBPC be kept steadfast, always abounding in the work of the Lord. And may the Gospel of Christ, sown during this Mission, in God’s will and time, bring souls to salvation for eternity, that the name of the Lord Jesus Christ may be magnified and glorified.
The exceeding warmth and love shown by the Filipino brethren throughout the Mission trip—and by all who came to the airport to send us off—soothed our weary bodies and warmed our hearts. Till we meet again, dear brethren in Cebu City, Bogo, and San Antonio, in God’s time and will, may the Lord keep and bless us all. 
Soli Deo Gloria!
`
            },
            {
                name: "Sis Lee Kim Lei",
                photos: [
                    ["sources/kimlei1.jpg", "Junior Worship at Cebu City GBPC"]
                ],
                quote: "I am grateful for the unity and wholeheartedness of the team... encouraging and helping wherever needed.",
                body: `Romans 1:11-12 “For I long to see you, that I may impart unto you some spiritual gift, to the end ye may be established; That is, that I may be comforted together with you by the mutual faith both of you and me.”
I have many things to praise and give thanks unto our Almighty God, namely:
For His enabling grace, which allowed me to join the M25 team to revisit our Mission churches after many years.
Despite trials—such as Pastor Reggor undergoing medical treatment when we arrived—I was overwhelmed by the hospitality and joyful spirit of the brethren in these three churches.
I witnessed children who had grown into youths and young adults serving fervently in the Cebu City church.
I was so blessed to be part of the M25 team ministering to many students and staff at the High School in Bogo. My heart was moved seeing how deeply some students were affected by the world, but filled with joy to see others attentively taking notes, listening intently to testimonies and the Gospel messages. I prayed earnestly for their salvation.
The Lord answered my prayer when we visited the Women’s Treatment and Rehabilitation Center, allowing me to speak to widows there. Out of 73 residents, two were assigned to me. They are Roman Catholics, aged 47 and 49. One had a child, while the other experienced widowhood twice, with seven children from both marriages. The Gospel booklets and Bibles we brought were a great blessing—like a guiding light showing them the path to salvation and helping them leave their previous way of life behind. Let us pray that the Holy Spirit will work in them and that they will continue to read the Bible, do devotions, and commit everything to the Lord.
I am grateful for the unity and wholeheartedness of the team. Every member served with zeal, not only ministering to the people but also supporting one another, encouraging and helping wherever needed. 
All Praise and Glory unto the Lord.
`
            },
            {
                name: "Eld Low Boon Siang",
                photos: [
                    ["sources/low1.jpg", "Preaching in the streets of Cebu City"]
                ],
                quote: "May the Lord strengthen our faith as we continue to serve our faithful and gracious God.",
                body: `2 Corinthians 9:8—”And God is able to make all grace abound toward you; that ye, always having all sufficiency in all things, may abound to every good work.”
This verse perfectly captures how God's abundant grace equips His people for His work. I am truly humbled and touched to have served alongside 22 dedicated brethren in Cebu City, Bogo, and San Antonio. The unity and love we shared throughout the six-day trip was a powerful reflection of Psalm 133:1.
I thank God for His grace in granting us good weather. Despite the challenging terrain, He withheld the rain until most of our home visits were completed. He even arranged a final downpour, which allowed us a pocket of time to pack goodie bags for the next day's program. Truly, "This is the LORD’s doing; it is marvellous in our eyes" (Psalm 118:23).
Two ministries left a deep impression on me. At the DOH-TRC in Cebu City, we preached the Gospel and shared testimonies with women recovering from drug abuse. The truth of John 8:36—"If the Son therefore shall make you free, ye shall be free indeed"—was made real here. Only God's power can truly transform lives, and I thank Him for the women's openness to His Word.
The other was at CRMC High School in Bogo, where our team ministered to more than 900 students and staff. We sang praises, preached the Gospel, and shared testimonies, planting seeds of truth in their hearts. We trust that God, in His sovereign time and purpose, will accomplish His saving work, knowing His Word "shall not return... void" (Isaiah 55:11).
Overall, this was a memorable and fruitful time of spiritual labor. I praise God for the tireless efforts of Eld Mah, Dn Gan, Bro Edward, and the Cebu brethren—Rev Reggor, Eld Eliezer, Dn Samuel, and Bro Allan—whose meticulous planning ensured the trip ran smoothly. I also rejoice in the faithful service of all the brethren who served wholeheartedly, big and small, for God's glory. May the Lord strengthen our faith as we continue to serve our faithful and gracious God.
`
            },
            {
                name: "Sis Magdalene Lim",
                photos: [
                    ["sources/magda1.jpg", "Support Team at Children’s Outreach at Sis Ophelia’s house"]
                ],
                quote: "Everyone worked with meticulous care, finding joy in their busy schedules and carrying out their mission tasks with gladness.",
                body: `Praise the Lord! I feel deeply honoured to have been able to participate in this mission trip.
I was initially hesitant to join because I do not consider myself a mature Christian. However, through prayer, God moved Eld Mah and Dn Gan to encourage me to be part of this team. Although I thought that I could not do much, the patience and understanding of brothers and sisters made me a useful assistant, and it turned out to be a wonderfully blessed experience.
I thank the Lord for allowing me to witness our team, under the leadership of Elder Mah, Dn Gan and Bro Edward, carry out their service to the Lord with dedication. Every day, under God's guidance, the organization and distribution of tasks led to the successful completion of all activities, especially the two large-scale evangelism outreaches. 
One endeavour for the Lord, reached out to nearly a thousand secondary school students and teachers. The other served a women’s drug rehabilitation center ministering to 110 women residents and staff.
As Romans 8:28 says, “And we know that all things work together for good to them that love God, to them who are the called according to his purpose.”
Team members diligently fulfilled their respective roles—whether in children’s outreach or evangelism, preaching or handling logistics matters, giving their testimonies or in music, planning and participating in visitations or gift preparation. Everyone worked with meticulous care, finding joy in their busy schedules and carrying out their mission tasks with gladness.
I would also like to express my special thanks to my I/C, Sis Peggy. While the two of us were in charge of gifts and refreshments, she managed all the planning, documentation, and contacts. Thank God for her wisdom and patience. I simply contributed with a submissive heart and diligent hands to accomplish the work together.
This is the first time I am participating in a short-term mission since joining our church in 2012. I am filled with gratitude and hope to continue participating whenever the opportunity arises. May the Lord grant more lives to be saved through missions.
Lastly, I thank God for giving us such a faithful pastor as our Pastor Koshy. Under his zealous teaching and pastoral care, our flock is able to serve effectively according to God’s will. I am truly grateful. I thank you, Lord. 
All glory be to Thy Name. 
`
            },
            {
                name: "Eld & Mrs Mah Chin Kwang",
                photos: [
                    ["sources/mah1.jpg", "Appreciation from Rehabilitation Centre"]
                ],
                quote: "The Lord hath done great things for us, whereof we are glad.",
                body: `“The Lord hath done great things for us, whereof we are glad.” (Ps126: 3)
Truly, our Almighty God has provided marvelously for Team Mission 25 from the very beginning as He gathered the leaders, preachers, able and faithful brothers and sisters as I/Cs and also joyful helping hands committed to bring the Gospel to Cebu City, Bogo and San Antonio. As we sought the Lord in earnest prayer, He provided in ways that continue to amaze us upon our return and reflection of the 6 days spent in Cebu. 
We thank God for opening the Gospel door to go to the High School in Bogo and the Rehabilitation Center in Cebu City.  Please pray with us, that the seed sown will fall on good ground and some souls may be added to His kingdom in due time.
Thanks be to God for His provision of funds from many cheerful givers to support the work during the trip.  We praise the Lord that the students and faculty of the college were given a booklet of John's Gospel and stationery.   Packet lunch and drinks were handed to each one as they left the hall at the end of the meeting. At the rehabilitation center, all the residents and  staff received the booklet too, and the KJV Bible each.  Gifts of rice and other daily necessities were given during the home visitation to brethren in our mission churches.
The ministry to the children everywhere we went was well attended.  Thank God for all brethren who worked together joyfully to bring the Word to them. We pray for these young ones that they may  know, and be saved by the Almighty God of the Bible lessons that were taught.  
We are thankful for the warm hospitality from brethren in our mission churches as they co-laboured with us. We are blessed with faithful preaching of the Word by Pr Jeremiah and Pr Samson, exhortations by the Elders and testimonies that were shared.  May believers be edified and encouraged to labour on.  May God be gracious to grant understanding and faith to believe to those who are lost in darkness and under bondage of sin.
We are thankful to our good God for blessing the mission team with good health, protection and His all sufficient, enabling grace for the activities for each day. Some may be tired but surely feel blessed with joyful hearts at the end of every day well spent in His vineyard.
“Only fear the LORD, and serve Him in truth with all your heart: for consider how great things he hath done for you.”  (1Sa 12:24) 
To Him be the glory!
`
            },
            {
                name: "Sis Peggy Lee",
                photos: [
                    ["sources/peggy1.jpg", "Interpreters for Children’s Outreach"],
                    ["sources/peggy2.jpg", "Interpreters for Children’s Outreach"]
                ],
                quote: "Having witnessed… I am beginning to learn to expect great things from God and to make myself available for His service.",
                body: `I thank God for the privilege of being a gift-bearer in M25. I had the joy of witnessing the gladness on the recipients’ faces, how they lit up upon receiving their gifts. One resident at the DOH-TRC clutched the Bible to her heart and exclaimed that at last she owned a Bible.
The delight in the recipients’ eyes upon receiving three small self-inking address stamps was priceless. They even sent me proof of their first use of the stamps, accompanied by words of thanks. These stamps would go a long way in supporting the distribution of tracts, which require the mission station’s address. Now, the address could be stamped effortlessly with the self-inking stamps. I was amazed to learn that the stamps had been gifted by a non-BP believer.
At the last Children’s Outreach, Sis Diana approached me apologetically, explaining that she needed two gifts for the local sisters who had served as interpreters on short notice. To my surprise, I found two books of similar topics in my bag, perfectly suited for her needs. God had provided for even the smallest detail and situation.
I marvelled at the Lord’s moving of brethren to contribute generously in both monetary gifts and personal efforts, and at His gracious equipping of the team members and local brethren for His work.
“And God is able to make all grace abound toward you; that ye, always having all sufficiency in all things, may abound to every good work” (2 Corinthians 9:8).
Having witnessed the wonderful way the Lord used a group of frail and feeble members to proclaim His gospel to more than 1,100 souls in this short visit, I am beginning to learn to expect great things from God and to make myself available for His service. 
All praise and glory be to God.
`
            },
            {
                name: "Pr Samson Hutagalung",
                photos: [
                    ["sources/samson1.jpg", "Proclaiming the Gospel At CRMC High School (Bogo)"]
                ],
                quote: "The Great Commission of Christ remains the responsibility of the church and of all believers today.",
                body: `O, what a blessing it was to be part of Mission Trip 2025! The Lord has been so good, from the planning and preparation to the completion of the ministries. Truly, it was not merely man’s effort, but God’s enablement, empowerment, and blessings upon the leaders and the team, that we might proclaim the Gospel of Christ to those outside the kingdom of God, and to comfort, encourage, and strengthen those who have been redeemed by Christ.
During this mission trip to Bogo, San Antonio, and Cebu City, our home visitations to members of the respective churches brought much encouragement through the preaching of God’s Word by preachers and elders. It is our continuous hope and prayer that the God of all comfort would strengthen them in the Lord despite the various challenges they face in life (cf. 2 Corinthians 1:3; Acts 15:36).
The Great Commission of Christ remains the responsibility of the church and of all believers today. The Lord Himself opens doors so that the Gospel may be proclaimed to sinners (Matthew 28:18-20; Acts 1:8). Such an opportunity was granted during this mission trip, during which the Gospel of Christ was preached to 900 students and staff. It is our prayer that the Spirit of God would work in the hearts of the hearers, that they might reflect on the meaning of life and come to the saving knowledge of our Lord Jesus Christ, for He alone is “the way, the truth, and the life” (John 14:6).
`
            },
            {
                name: "Sis Sheryl Macapinig",
                photos: [
                    ["sources/sheryl.jpg", "Sharing testimony at DOH-TRC (Cebu City)"]
                ],
                quote: "Behold, how good and how pleasant it is for brethren to dwell together in unity!",
                body: `When Eld Mah announced the Short-term Mission Trip to three churches in Cebu on 30 March during the Worship Service, I hoped to join, but my annual leave had already been planned since last year, 2024. When I attended the GBPC Combined Church Camp in Cebu last May, Pastor Reggor encouraged me to join the mission trip to help in the ministry. The Lord moved my heart to request consecutive days off from work. I trusted the Lord, even though there was a possibility that my request might not be granted; still, I went ahead and booked a plane ticket. Praise the Lord, my request was approved; however, I was only allowed 4 days off, from 7 to 10 August. Nevertheless, I am truly thankful to God for the opportunity to join. The Lord reminded me of Mark 16:15 - “And he said unto them, Go ye into all the world, and preach the gospel to every creature.”
I thank God for the Mission Team for their warm welcome and for allowing me to be part of the mission work for the first time. Since I am from the Philippines (one of the mission stations), I am usually among those who receive the team; but this time, I was part of the team myself. I was assigned as a Mission Medical Nurse and also to share a testimony about the DOH treatment and rehabilitation for women.
On the day of my arrival in Cebu, I thank God that I was able to help my mother, Sis Ophelia, in preparing for the Gospel outreach to be held in her house. I also thank God that I could attend the prayer meeting, fellowship meeting, home visitations, and Sunday worship service. These reminded me of the following Bible verses: 1 Thessalonians 5:11 – “Wherefore comfort (exhort) yourselves together (one another, mutually), and edify (build up, strengthen) one another, even as also ye do.” And Hebrews 10:25 – “Not forsaking the assembling of ourselves together, as the manner of some is; but exhorting one another: and so much the more, as ye see the day approaching.”
I was encouraged and blessed to see some of the brethren in Cebu stepping up to take on various tasks without the physical supervision of Pastor Reggor, as he was resting from the first session of his chemotherapy. This reminded me of Psalm 133:1 – “Behold, how good and how pleasant it is for brethren to dwell together in unity!”
I thank God for the opportunity to share my testimony in Cebuano with more than 70 women and staff at the DOH Rehab Centre for Women. It was my first time visiting the place and seeing the residents of different age groups. I cannot imagine how their lives were before the rehab, but I am truly grateful to the Lord for this chance to share the gospel with them, to give encouragement, and to testify that there is hope in the Lord Jesus Christ.
I also thank God for using our house as a place for gospel outreach to children and adults. I hope and pray that all who heard the gospel will, in God’s time, accept the Lord Jesus Christ as their Saviour, to the glory of God. May the Lord use me and the team to continue His work. As it is written in 1 Corinthians 15:58 – “Therefore, my beloved brethren, be ye stedfast, unmoveable, always abounding in the work of the Lord, forasmuch as ye know that your labour is not in vain in the Lord.”
All glory be to God!
`
            },
            {
                name: "Dn & Mrs Tan Eng Huat",
                photos: [
                    ["sources/tan1.jpg", "Cheerful welcome at Cebu Airport"],
                    ["sources/tan2.jpg", "Singspiration at Sis Ophelia’s house"]
                ],
                quote: "We sought the Lord to help us serve with humility, joy, and gladness, and with clean hands and pure hearts.",
                body: `When we first heard that a mission trip to Cebu City, Bogo, and San Antonio was being organised for August, we were moved in our hearts to join and serve. Yet, questions arose that sought to dissuade us. What roles could we play in this mission trip? Would we be able to withstand the physical and mental rigours of long, hot hours in the mission fields? Would the trip be in vain if a great typhoon struck Cebu City, Bogo, or San Antonio in August? After a season of prayer together and enquiry with Eld Mah, we made the decision to join the team. We committed the matter to the Lord, trusting that He would enable us and grant us the wisdom and strength to serve alongside the brethren. We sought the Lord to help us serve with humility, joy, and gladness, and with clean hands and pure hearts.
We were deeply touched by the charity and warmth of the brethren in Cebu City and Bogo/San Antonio who came to receive the team at the airport. Their zeal for the Gospel was evident as they joined hearts and minds with the M25 team, pleading with God for the salvation of the many young people in the CRMC High School (Bogo) and incarcerated women in the DOH-TRC (Cebu City), and persuading them to turn to our Saviour.
We also rejoiced greatly in witnessing the selfless and diligent service rendered by the M25 and Filipino brethren as we laboured together for countless lost souls. We observed how every single labourer was alert and attentive to quickly fill any gap whether small or great, as the planned programmes unfolded, so that God’s Word and work would not be hindered.
Despite the long hours, humid conditions, and physical exertions—including trudging through muddy ground to reach several brethren’s homes in San Antonio—there was not a single complaint among the team members. Instead, everyone was mindful of one another’s comfort during the ministry of the Word and the Gospel outreach programmes.
We are grateful to have witnessed firsthand how the Holy Spirit enabled the brethren to work in unity and harmony, constrained by the love of Christ, toward a common goal. We also saw the joy of serving our God and Redeemer in a brother guitarist, who, from sheer fatigue, momentarily nodded off while strumming a hymn during the final night of service at the neighbourhood Gospel outreach in Sister Ophelia’s home.
We were further privileged to see how God intervened in granting us safe and unhindered access to various homes in Bogo, San Antonio, and Cebu City. August being the rainy and typhoon season, there were several occasions when the dark sky threatened to open upon us and disrupt the programmes. Yet, it was clear to us that God commanded the heavy clouds to withhold their rain until we were safely indoors, and the sun to shine to dry the ground before we tread the worn concrete steps of a steep slope leading to and from a brethren’s home—lest many fall and be seriously injured. Our merciful Lord also intervened to break the fall of a sister on the steps, preventing what could have been a severe injury.
It is truly wonderful to see how God moved the hearts of the authorities in both CRMC High School and DOH-TRC (Cebu City) to allow Pr Samson and Pr Jeremiah to preach the Gospel of salvation to a captive audience of more than a thousand souls. Even more amazing is the fact that invitations were extended for the team to return every year to continue the evangelistic programmes at both places! Our Lord is greatly to be praised for His marvellous work through His people!
We are indeed filled with gratitude and thanksgiving that God has permitted and provided us the opportunity to be part of the M25 mission team and to witness His mighty acts in Cebu City and Bogo/San Antonio. We are greatly blessed and encouraged by the love, faith, and exemplary testimony of the leaders, their families, and the brethren. We are also deeply touched by God’s faithfulness in blessing and providing for His children.
We now appreciate more deeply the Apostle Paul’s affection for the believers in Philippi, as he wrote in Philippians 1:3–6:
“I thank my God upon every remembrance of you, Always in every prayer of mine for you all making request with joy, For your fellowship in the gospel from the first day until now; Being confident of this very thing, that he which hath begun a good work in you will perform it until the day of Jesus Christ.” We will continue to pray for our brethren in the Philippines.
`
            },
            {
                name: "Pastor Reggor Galarpe",
                photos: [
                    ["sources/reggor1.jpg", "Pastor Reggor’s welcoming the team at Cebu City GBPC"]
                ],
                quote: "We have been greatly blessed by your labors in the work of the Gospel and by your love for the brethren.",
                body: `In this very challenging time, as I endure much affliction in the body, the mission team’s visit has been a great encouragement and comfort to me, my family, and the church in general. We have been greatly blessed by your labors in the work of the Gospel and by your love for the brethren. No doubt, you came to minister—and indeed have ministered—in a very special way.
In the words of the Apostle Paul: “For they have refreshed my spirit and yours: therefore acknowledge ye them that are such” (1 Corinthians 16:18). Truly, you have refreshed our spirit! You have been God’s vessels of grace, renewing our tired and weary souls, encouraging and comforting us, and even filling and supplying that which we lack in the work of the ministry. 
All praise and glory be to the Lord!
`
            }
        ];
        const cards = document.querySelectorAll('.testimony-card');
        const modal = document.getElementById('testimonyModal');
        const modalClose = document.getElementById('testimonyModalClose');
        const modalPhotos = document.getElementById('testimonyModalPhotos');
        const modalName = document.getElementById('testimonyModalName');
        const modalBody = document.getElementById('testimonyModalBody');

        function createPhotosDisplay(testimony) {
            let photos = testimony.photos || [];

            // Backward compatibility: if no photos array but has photo/photoCaption, create one
            if (photos.length === 0 && testimony.photo) {
                photos = [[testimony.photo, testimony.photoCaption || testimony.name]];
            }

            // Clear existing content
            modalPhotos.innerHTML = '';

            if (photos.length === 0) return;

            // Create photo elements with captions
            photos.forEach((photo, index) => {
                const photoContainer = document.createElement('div');
                photoContainer.style.display = 'flex';
                photoContainer.style.flexDirection = 'column';
                photoContainer.style.alignItems = 'center';

                const img = document.createElement('img');
                img.src = photo[0];
                img.alt = photo[1] || testimony.name;
                img.style.cursor = 'pointer';

                // Add click handler to open image modal
                img.addEventListener('click', function (e) {
                    e.stopPropagation(); // Prevent testimony modal from closing

                    // Get the image modal elements
                    const imgModal = document.getElementById('imgModal');
                    const imgModalImg = document.getElementById('imgModalImg');
                    const imgModalCaption = document.getElementById('imgModalCaption');

                    if (imgModal && imgModalImg && imgModalCaption) {
                        imgModalImg.src = photo[0];
                        imgModalImg.alt = photo[1] || testimony.name;
                        imgModalCaption.textContent = photo[1] || testimony.name;
                        imgModal.classList.add('active');

                        // Reset zoom if resetZoom function is available
                        const modalContentWrap = document.getElementById('imgModalContentWrap');
                        if (modalContentWrap) {
                            modalContentWrap.style.transform = '';
                            modalContentWrap.classList.remove('zoomed');
                        }
                    }
                });

                photoContainer.appendChild(img);

                if (photo[1]) {
                    const caption = document.createElement('div');
                    caption.className = 'testimony-modal-photo-caption';
                    caption.textContent = photo[1];
                    photoContainer.appendChild(caption);
                }

                modalPhotos.appendChild(photoContainer);
            });
        }

        // Only initialize testimony modal if elements exist
        if (modal && modalClose && modalPhotos && modalName && modalBody && cards.length > 0) {
            // Open modal on card click
            cards.forEach(function (card) {
                card.addEventListener('click', function () {
                    const idx = parseInt(card.getAttribute('data-index'));
                    const t = testimonies[idx];

                    // Set text content
                    modalName.textContent = t.name;
                    modalBody.innerHTML = t.body;

                    // Create photos display
                    createPhotosDisplay(t);

                    modal.classList.add('active');
                });
            });
            // Close modal
            modalClose.addEventListener('click', function () {
                modal.classList.remove('active');
            });
            // Close modal on outside click
            modal.addEventListener('click', function (e) {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
            // ESC key to close
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    modal.classList.remove('active');
                }
            });
        }

        // Modal popup for all images with auto-pan on zoom
        (function () {
            const modal = document.getElementById('imgModal');
            const modalImg = document.getElementById('imgModalImg');
            const modalClose = document.getElementById('imgModalClose');
            const modalContentWrap = document.getElementById('imgModalContentWrap');

            // Only initialize image modal if elements exist
            if (!modal || !modalImg || !modalClose || !modalContentWrap) {
                return;
            }

            let scale = 1;
            let translateX = 0, translateY = 0;

            function resetZoom() {
                scale = 1;
                modalContentWrap.style.transform = '';
                modalImg.classList.remove('zoomed');
            }

            // Attach click event to all images except those in testimony modal
            document.querySelectorAll('img').forEach(function (img) {
                // Skip images inside testimony modal
                if (img.closest('#testimonyModalPhotos')) {
                    return;
                }

                img.style.cursor = 'pointer';
                img.addEventListener('click', function (e) {
                    // Only open modal if not already open for this image
                    if (!modal.classList.contains('active') || modalImg.src !== img.src) {
                        modalImg.src = img.src;
                        modalImg.alt = img.alt || '';
                        document.getElementById('imgModalCaption').textContent = img.getAttribute('data-caption') || img.alt || '';
                        modal.classList.add('active');
                        resetZoom();
                    }
                });
            });
            // Close modal on button click
            modalClose.addEventListener('click', function () {
                modal.classList.remove('active');
                modalImg.src = '';
                document.getElementById('imgModalCaption').textContent = '';
                resetZoom();
            });
            // Close modal on outside click
            modal.addEventListener('click', function (e) {
                if (e.target === modal) {
                    modal.classList.remove('active');
                    modalImg.src = '';
                    document.getElementById('imgModalCaption').textContent = '';
                    resetZoom();
                }
            });
            // Close modal on ESC key
            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape' && modal.classList.contains('active')) {
                    modal.classList.remove('active');
                    modalImg.src = '';
                    document.getElementById('imgModalCaption').textContent = '';
                    resetZoom();
                }
            });
            // Click to zoom toggle
            modalContentWrap.addEventListener('click', function (e) {
                e.stopPropagation(); // Prevent modal image click from bubbling up
                if (scale === 1) {
                    scale = 2;
                    modalContentWrap.classList.add('zoomed');
                    translateX = 0;
                    translateY = 0;
                    modalContentWrap.style.transform = `scale(${scale})`;
                } else {
                    scale = 1;
                    modalContentWrap.classList.remove('zoomed');
                    translateX = 0;
                    translateY = 0;
                    modalContentWrap.style.transform = '';
                }
                modalContentWrap.classList.toggle('zoomed', scale > 1);
            });
            // Mousemove to auto-pan when zoomed
            modalContentWrap.addEventListener('mousemove', function (e) {
                if (scale > 1) {
                    const rect = modalContentWrap.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    const percentX = x / rect.width;
                    const percentY = y / rect.height;
                    // Sine-based easing for less movement at edges
                    const easedX = Math.sin((percentX - 0.5) * Math.PI);
                    const easedY = Math.sin((percentY - 0.5) * Math.PI);
                    // Custom easing: gentle at edges, dampened at center
                    const maxTranslateX = (rect.width * (scale - 1)) / (2 * scale);
                    const maxTranslateY = (rect.height * (scale - 1)) / (2 * scale);
                    const dampenCenter = 0.5; // Lower = less movement at center
                    const customEaseX = easedX * dampenCenter;
                    const customEaseY = easedY * dampenCenter;
                    translateX = maxTranslateX * customEaseX;
                    translateY = maxTranslateY * customEaseY;
                    modalContentWrap.style.transform = `scale(${scale}) translate(${-translateX}px, ${-translateY}px)`;
                }
            });
            // Zoom with mouse wheel
            modalContentWrap.addEventListener('wheel', function (e) {
                e.preventDefault();
                let delta = e.deltaY > 0 ? -0.2 : 0.2;
                let newScale = Math.min(Math.max(scale + delta, 1), 5);
                if (newScale !== scale) {
                    scale = newScale;
                    if (scale > 1) {
                        modalContentWrap.classList.add('zoomed');
                    } else {
                        modalContentWrap.classList.remove('zoomed');
                    }
                    modalContentWrap.style.transform = `scale(${scale})`;
                }
            });
            // Double click to reset zoom
            modalContentWrap.addEventListener('dblclick', function () {
                scale = 1;
                modalContentWrap.classList.remove('zoomed');
                modalContentWrap.style.transform = '';
            });
            // Touch: auto-pan on move when zoomed
            modalContentWrap.addEventListener('touchmove', function (e) {
                if (scale === 1 || e.touches.length !== 1) return;
                const rect = modalContentWrap.getBoundingClientRect();
                const x = e.touches[0].clientX - rect.left;
                const y = e.touches[0].clientY - rect.top;
                const percentX = x / rect.width;
                const percentY = y / rect.height;
                // Sine-based easing for less movement at edges
                const easedX = Math.sin((percentX - 0.5) * Math.PI);
                const easedY = Math.sin((percentY - 0.5) * Math.PI);
                // Custom easing: gentle at edges, dampened at center
                const edgeDampen = 0.5;
                const maxTranslateX = (rect.width * (scale - 1)) / (2 * scale);
                const maxTranslateY = (rect.height * (scale - 1)) / (2 * scale);
                const dampenCenter = 0.15;
                const customEaseX = easedX * (1 - Math.abs(percentX - 0.5) * edgeDampen) * dampenCenter;
                const customEaseY = easedY * (1 - Math.abs(percentY - 0.5) * edgeDampen) * dampenCenter;
                const translateX = maxTranslateX * customEaseX;
                const translateY = maxTranslateY * customEaseY;
                modalContentWrap.style.transform = `scale(${scale}) translate(${-translateX}px, ${-translateY}px)`;
            });
        })()

        // Auto-rotating Carousel functionality
        function initCarousel() {
            const carousel = document.querySelector('.homes-carousel');
            if (!carousel) return;

            const track = document.getElementById('carouselTrack');
            const slides = document.querySelectorAll('.carousel-slide');
            const prevBtn = document.getElementById('carouselPrev');
            const nextBtn = document.getElementById('carouselNext');
            const playPauseBtn = document.getElementById('carouselPlayPause');
            const indicators = document.querySelectorAll('.carousel-indicator');

            if (!track || slides.length === 0) return;

            let currentSlide = 0;
            let isPlaying = true;
            let autoplayInterval;

            // Start autoplay
            function startAutoplay() {
                if (autoplayInterval) clearInterval(autoplayInterval);
                autoplayInterval = setInterval(() => {
                    if (isPlaying) {
                        nextSlide();
                    }
                }, 4000); // Change slide every 4 seconds
            }

            // Stop autoplay
            function stopAutoplay() {
                if (autoplayInterval) {
                    clearInterval(autoplayInterval);
                    autoplayInterval = null;
                }
            }

            // Update slide position
            function updateSlide() {
                const translateX = -currentSlide * 100;
                track.style.transform = `translateX(${translateX}%)`;

                // Update indicators
                indicators.forEach((indicator, index) => {
                    indicator.classList.toggle('active', index === currentSlide);
                });
            }

            // Next slide
            function nextSlide() {
                currentSlide = (currentSlide + 1) % slides.length;
                updateSlide();
            }

            // Previous slide
            function prevSlide() {
                currentSlide = (currentSlide - 1 + slides.length) % slides.length;
                updateSlide();
            }

            // Toggle play/pause
            function togglePlayPause() {
                isPlaying = !isPlaying;
                playPauseBtn.textContent = isPlaying ? '⏸' : '▶';
                if (isPlaying) {
                    startAutoplay();
                } else {
                    stopAutoplay();
                }
            }

            // Event listeners
            if (prevBtn) {
                prevBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    prevSlide();
                    if (isPlaying) {
                        stopAutoplay();
                        startAutoplay(); // Restart timer
                    }
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    nextSlide();
                    if (isPlaying) {
                        stopAutoplay();
                        startAutoplay(); // Restart timer
                    }
                });
            }

            if (playPauseBtn) {
                playPauseBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    togglePlayPause();
                });
            }

            // Indicator clicks
            indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', (e) => {
                    e.stopPropagation();
                    currentSlide = index;
                    updateSlide();
                    if (isPlaying) {
                        stopAutoplay();
                        startAutoplay(); // Restart timer
                    }
                });
            });

            // Click on slide to open modal
            slides.forEach((slide) => {
                slide.addEventListener('click', () => {
                    const img = slide.querySelector('img');
                    const modal = document.getElementById('imgModal');
                    const modalImg = document.getElementById('imgModalImg');
                    const modalCaption = document.getElementById('imgModalCaption');

                    if (modal && modalImg && img) {
                        modalImg.src = img.src;
                        modalImg.alt = img.alt;
                        modalCaption.textContent = img.getAttribute('data-caption') || img.alt;
                        modal.classList.add('active');

                        // Pause carousel when modal opens
                        if (isPlaying) {
                            stopAutoplay();
                        }
                    }
                });
            });

            // Resume carousel when modal closes
            const modal = document.getElementById('imgModal');
            if (modal) {
                const modalClose = document.getElementById('imgModalClose');
                if (modalClose) {
                    modalClose.addEventListener('click', () => {
                        if (isPlaying) {
                            startAutoplay();
                        }
                    });
                }

                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        if (isPlaying) {
                            startAutoplay();
                        }
                    }
                });
            }

            // Pause on hover, resume on leave
            carousel.addEventListener('mouseenter', () => {
                if (isPlaying) stopAutoplay();
            });

            carousel.addEventListener('mouseleave', () => {
                if (isPlaying) startAutoplay();
            });

            // Initialize
            updateSlide();
            startAutoplay();
        }

        // Initialize carousel
        initCarousel();

    }, 50); // 50ms delay to ensure DOM is fully rendered
});
