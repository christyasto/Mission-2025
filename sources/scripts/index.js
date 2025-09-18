document.addEventListener('DOMContentLoaded', function () {
    // Navbar active section tracker
    const navLinks = document.querySelectorAll('nav a');
    const sections = Array.from(navLinks).map(link => {
        const id = link.getAttribute('href').replace('#', '');
        return document.getElementById(id);
    });

    function setActiveNav() {
        let activeIdx = 0;
        const scrollY = window.scrollY + 80; // Offset for sticky nav
        sections.forEach((section, idx) => {
            if (section && section.offsetTop <= scrollY) {
                activeIdx = idx;
            }
        });
        // Remove active-nav and focus from all links first
        navLinks.forEach(link => {
            link.classList.remove('active-nav');
            link.blur();
        });
        // Add active-nav only to the latest active
        if (navLinks[activeIdx]) {
            navLinks[activeIdx].classList.add('active-nav');
        }
    }
    window.addEventListener('scroll', setActiveNav);
    setActiveNav();
    // Testimony modal logic
    const testimonies = [
        {
            name: "Eld Eliezer Ortega",
            photo: "sources/eliezer.jpg",
            photoCaption: "Mission team with brethren from GBPC (Bogo and San Antonio)",
            quote: "Blessed be the name of the LORD, who is the God full of grace and mercy...",
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
            photo: "sources/dnsDiana1.jpg",
            photoCaption: "Pastor Koshy praying for M25 at Changi Airport",
            quote: "My heart is filled with awe and reverence for the Lord, and my soul sings, 'How great Thou art!'",
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
            photo: "sources/eldChoy1.jpg",
            photoCaption: "Children’s outreach at San Antonio",
            quote: "Thank God for moving the hearts of Luan Kheng and myself to sign up for this mission trip...",
            body: `Thank God for moving the hearts of Luan Kheng and myself to sign up for this mission trip the moment it was announced, and for counting us worthy to labour in His vineyard. It was truly a blessed mission trip, led by Elder Mah, Dn Gan, and Bro Edward, who together with Rev Reggor, Eld Eliezer, Bro Allan and later, including Dn Samuel, formed the Central Committee. The trip was very well planned and executed.
</br>We had a wonderful opportunity to share God’s Word with the children, as well as in home fellowships with the local brethren. It was a blessed time of mutual encouragement and fellowship. Some of the brethren there, though possessing little in terms of earthly goods, had joyful smiles upon their faces. In Bogo and San Antonio, some of the brethren lived on the slope of a hill, which could be precarious during heavy downpours as the area was prone to landslides. There were neither concrete paths nor steps for them to escape quickly in the event of danger. It was not easy for us to visit the brethren’s homes because of the steep and muddy terrain. Thank God for Eld Eliezer‘s faithful spiritual oversight of the churches in Bogo and San Antonio.
</br>I was deeply touched by the testimonies I heard for the first time from our brethren. The Lord had seen them through very difficult times, and they could still magnify the name of the Lord for His goodness before all.
</br>I also thank God for enabling us to share the Gospel at the CRMC High School, where approximately 900 students and staff were in attendance. The principal, staff, and students warmly welcomed us. We ministered to them through songs, testimonies, and the preaching of the Gospel message by Pr Samson. The students were very attentive, and I pray that the Lord will convict the hearts of all who heard the message.
</br>We were likewise given the opportunity for Pr Jeremiah to share the Gospel at the DOH-TRC, where over 70 female residents attended the meeting. Breaking up into smaller groups enabled closer interaction and gave them the chance to ask questions, which was most helpful. We pray that the Gospel materials distributed will help them better understand the message of salvation. For those soon to be released, may they attend our mission church in Cebu City.
</br>The Gospel rally at Sis Ophelia’s home was also well attended. Once again, a powerful Gospel message was preached by Pr Samson. Many children came, and we thank God for our sisters who faithfully taught them God’s Word. Let's pray that some might turn to Christ and come to church.
</br>Finally, we thank God for granting us good weather throughout the trip, despite it being the typhoon season. Truly, the Lord was gracious to us all. “I will praise the name of God with a song, and will magnify him with thanksgiving” (Psalm 69:30).
`
        },
        // Add more testimonies here
    ];
    const cards = document.querySelectorAll('.testimony-card');
    const modal = document.getElementById('testimonyModal');
    const modalClose = document.getElementById('testimonyModalClose');
    const modalPhoto = document.getElementById('testimonyModalPhoto');
    const modalName = document.getElementById('testimonyModalName');
    const modalBody = document.getElementById('testimonyModalBody');
    // Open modal on card click
    cards.forEach(function (card) {
        card.addEventListener('click', function () {
            const idx = parseInt(card.getAttribute('data-index'));
            const t = testimonies[idx];
            modalPhoto.src = t.photo;
            modalPhoto.alt = t.photoCaption || t.name;
            modalName.textContent = t.name;
            modalBody.innerHTML = t.body;
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

    // Modal popup for all images with auto-pan on zoom
    (function () {
        const modal = document.getElementById('imgModal');
        const modalImg = document.getElementById('imgModalImg');
        const modalClose = document.getElementById('imgModalClose');
        const modalContentWrap = document.getElementById('imgModalContentWrap');
        let scale = 1;
        let translateX = 0, translateY = 0;

        function resetZoom() {
            scale = 1;
            modalContentWrap.style.transform = '';
            modalImg.classList.remove('zoomed');
        }

        // Attach click event to all images
        document.querySelectorAll('img').forEach(function (img) {
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
});
