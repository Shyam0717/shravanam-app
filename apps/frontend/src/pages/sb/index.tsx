'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SBLecturesPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/lectures?speaker=prabhupada&collection=sb');
    }, [router]);

    return null;
}
