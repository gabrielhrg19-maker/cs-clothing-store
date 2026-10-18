import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const DEFAULT_MP_ACCESS_TOKEN =
  process.env.MERCADO_PAGO_ACCESS_TOKEN ||
  'APP_USR-3345611795216825-031010-c151d4812a4f61dac62f4135483553a6-214542459';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      amount,
      description,
      email,
      firstName,
      lastName,
      customToken,
    } = body;

    const token = customToken?.trim() || DEFAULT_MP_ACCESS_TOKEN;

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { error: 'Valor da transação inválido.' },
        { status: 400 }
      );
    }

    const payload = {
      transaction_amount: Number(Number(amount).toFixed(2)),
      description: description || 'CS Clothing Store - Camisaria Premium',
      payment_method_id: 'pix',
      payer: {
        email: email || 'cliente@csclothing.com.br',
        first_name: firstName || 'Cliente',
        last_name: lastName || 'CS Clothing',
      },
    };

    const idempotencyKey = crypto.randomUUID();

    const response = await fetch('https://api.mercadopago.com/v1/payments', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Erro na API Mercado Pago:', data);
      return NextResponse.json(
        {
          error: data.message || 'Erro ao comunicar com Mercado Pago.',
          details: data,
        },
        { status: response.status }
      );
    }

    const transactionData = data.point_of_interaction?.transaction_data;

    return NextResponse.json({
      success: true,
      id: data.id,
      status: data.status,
      statusDetail: data.status_detail,
      qrCode: transactionData?.qr_code || '',
      qrCodeBase64: transactionData?.qr_code_base64 || '',
      ticketUrl: transactionData?.ticket_url || '',
      dateCreated: data.date_created,
      dateOfExpiration: data.date_of_expiration,
    });
  } catch (error: any) {
    console.error('Erro ao processar Pix Mercado Pago:', error);
    return NextResponse.json(
      { error: error.message || 'Erro interno do servidor.' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const customToken = searchParams.get('token');

    if (!id) {
      return NextResponse.json(
        { error: 'ID do pagamento não fornecido.' },
        { status: 400 }
      );
    }

    const token = customToken?.trim() || DEFAULT_MP_ACCESS_TOKEN;

    const response = await fetch(`https://api.mercadopago.com/v1/payments/${id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Não foi possível consultar o status do pagamento.', details: data },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      status: data.status,
      statusDetail: data.status_detail,
      isPaid: data.status === 'approved',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao consultar pagamento.' },
      { status: 500 }
    );
  }
}
