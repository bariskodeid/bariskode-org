import type { APIRoute } from 'astro';

import { createTrustedPocketBase, getPocketBaseUrl } from '../../../../lib/pocketbase';
import { isValidPocketBaseId } from '../../../../lib/validation';

function jsonError(status: number, error: string) {
    return new Response(JSON.stringify({ error }), {
        status,
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'private, no-store',
        },
    });
}

export const GET: APIRoute = async ({ locals, params }) => {
    if (!locals.user) {
        return jsonError(401, 'Unauthorized');
    }

    const certId = params.certId;
    if (!isValidPocketBaseId(certId)) {
        return jsonError(400, 'Invalid certId');
    }

    try {
        const pb = await createTrustedPocketBase();
        const certificate = await pb.collection('certificates').getOne(certId, {
            fields: 'id,user,file,is_valid',
        });

        const isOwner = certificate.user === locals.user.id;
        const isAdmin = locals.user.role === 'admin';
        if (!isOwner && !isAdmin) {
            return jsonError(403, 'Forbidden');
        }

        if (!certificate.file) {
            return jsonError(404, 'Certificate PDF not found');
        }

        if (certificate.is_valid === false) {
            return jsonError(410, 'Certificate is no longer valid');
        }

        const fileUrl = `${getPocketBaseUrl()}/api/files/certificates/${certificate.id}/${certificate.file}`;
        const upstream = await fetch(fileUrl, {
            headers: {
                Authorization: pb.authStore.token ? `Bearer ${pb.authStore.token}` : '',
            },
        });

        if (!upstream.ok || !upstream.body) {
            return jsonError(upstream.status || 502, 'Failed to download certificate PDF');
        }

        return new Response(upstream.body, {
            status: 200,
            headers: {
                'Content-Type': upstream.headers.get('content-type') ?? 'application/pdf',
                'Content-Disposition': `attachment; filename="certificate-${certificate.id}.pdf"`,
                'Cache-Control': 'private, no-store',
            },
        });
    } catch {
        return jsonError(500, 'Failed to download certificate PDF');
    }
};
