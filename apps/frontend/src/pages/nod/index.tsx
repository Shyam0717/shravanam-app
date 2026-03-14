'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function NODLecturesPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace('/lectures?speaker=prabhupada&collection=nod');
    }, [router]);

    return null;
}
