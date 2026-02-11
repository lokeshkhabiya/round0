"use client"
import React, { useRef, useEffect, useState } from "react"
import { useInView } from 'react-intersection-observer';

const MAX_TILT_DEG = 12;
const SCROLL_RANGE = 0.6;

const HeroSectionImage = () => {
	const videoRef = useRef<HTMLVideoElement>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const { ref: inViewRef, inView } = useInView({ threshold: 0 });
	const [rotateX, setRotateX] = useState(MAX_TILT_DEG);


	const setRefs = (el: HTMLDivElement | null) => {
		(containerRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
		(inViewRef as (el: HTMLDivElement | null) => void)(el);
	};

	useEffect(() => {
		if (inView && videoRef.current) {
			videoRef.current.play();
		}
	}, [inView]);

	useEffect(() => {
		const updateTilt = () => {
			const el = containerRef.current;
			if (!el) return;
			const rect = el.getBoundingClientRect();
			const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
			// Progress 0 = element at bottom of viewport (max tilt), 1 = element scrolled up (straight)
			const progress = 1 - Math.min(1, Math.max(0, rect.top / (viewportHeight * SCROLL_RANGE)));
			const tilt = MAX_TILT_DEG * (1 - progress);
			setRotateX(tilt);
		};

		updateTilt();
		window.addEventListener('scroll', updateTilt, { passive: true });
		window.addEventListener('resize', updateTilt);
		return () => {
			window.removeEventListener('scroll', updateTilt);
			window.removeEventListener('resize', updateTilt);
		};
	}, []);

	return (
		<div
			ref={setRefs}
			className='w-[70vw] h-[70vh] rounded-3xl flex justify-center items-center'
			style={{
				perspective: '1200px',
			}}
		>
			<div
				style={{
					width: '95%',
					height: '95%',
					borderRadius: '1.5rem',
					overflow: 'hidden',
					transform: `perspective(1200px) rotateX(${rotateX}deg)`,
					transformStyle: 'preserve-3d',
					transition: 'transform 0.1s ease-out',
				}}
			>
				<video
					ref={videoRef}
					src="/hero-section-video.mp4"
					muted
					playsInline
					autoPlay
					loop
					style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
				/>
			</div>
		</div>
	);
};

export default HeroSectionImage;