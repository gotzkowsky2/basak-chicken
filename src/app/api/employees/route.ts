import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

// 디버깅: 실제로 읽히는 DATABASE_URL을 콘솔에 출력
console.log('DEBUG DATABASE_URL:', process.env.DATABASE_URL);

const prisma = new PrismaClient();

export async function GET() {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
    });

    // 비밀번호 제외하고 반환
    const employeesWithoutPassword = employees.map((employee: any) => {
      const { password, ...employeeWithoutPassword } = employee;
      return employeeWithoutPassword;
    });

    return NextResponse.json(employeesWithoutPassword);
  } catch (error) {
    console.error("직원 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "직원 목록을 불러오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 필수 필드 검증
    if (!body.employeeId || !body.password || !body.name || !body.department || !body.position) {
      return NextResponse.json(
        { error: "필수 필드가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 중복 직원 ID 검증
    const existingEmployee = await prisma.employee.findUnique({
      where: { employeeId: body.employeeId },
    });

    if (existingEmployee) {
      return NextResponse.json(
        { error: "이미 존재하는 직원 ID입니다." },
        { status: 400 }
      );
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // 직원 생성
    const newEmployee = await prisma.employee.create({
      data: {
        employeeId: body.employeeId,
        password: hashedPassword,
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        department: body.department,
        position: body.position,
        isActive: body.isActive !== undefined ? body.isActive : true,
      },
    });

    // 이메일 발송
    if (body.sendEmail && newEmployee.email) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.BASAK_SMTP_HOST,
          port: Number(process.env.BASAK_SMTP_PORT),
          secure: false,
          auth: {
            user: process.env.BASAK_SMTP_USER,
            pass: process.env.BASAK_SMTP_PASS,
          },
        });
        await transporter.sendMail({
          from: process.env.BASAK_SMTP_FROM,
          to: newEmployee.email,
          subject: "[Basak Chicken] 직원 계정 생성 안내",
          text: `안녕하세요, ${newEmployee.name}님!\n\nBasak Chicken 직원 계정이 생성되었습니다.\n\n아이디: ${newEmployee.employeeId}\n로그인 후 비밀번호를 꼭 변경해 주세요.\n\n감사합니다.`,
        });
      } catch (mailErr) {
        console.error("직원 계정 생성 메일 전송 오류:", mailErr);
      }
    }

    // 비밀번호 제외하고 반환
    const { password, ...employeeWithoutPassword } = newEmployee;

    return NextResponse.json(employeeWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("직원 추가 오류:", error);
    return NextResponse.json(
      { error: "직원 추가 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    // 필수 필드 검증
    if (!body.id) {
      return NextResponse.json(
        { error: "직원 id가 필요합니다." },
        { status: 400 }
      );
    }
    // 기존 직원 정보 조회
    const existingEmployee = await prisma.employee.findUnique({
      where: { id: body.id },
    });
    if (!existingEmployee) {
      return NextResponse.json(
        { error: "해당 직원이 존재하지 않습니다." },
        { status: 404 }
      );
    }
    // 업데이트 데이터 준비
    const updateData: any = {
      name: body.name ?? existingEmployee.name,
      email: body.email ?? existingEmployee.email,
      phone: body.phone ?? existingEmployee.phone,
      department: body.department ?? existingEmployee.department,
      position: body.position ?? existingEmployee.position,
      isActive: body.isActive ?? existingEmployee.isActive,
      isSuperAdmin: body.isSuperAdmin ?? existingEmployee.isSuperAdmin,
      address: body.address ?? existingEmployee.address,
    };
    // 비밀번호 변경 시 해시화
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10);
    }
    // 직원 정보 업데이트
    const updatedEmployee = await prisma.employee.update({
      where: { id: body.id },
      data: updateData,
    });
    // 이메일 발송 (수정)
    if (body.sendEmail && updatedEmployee.email) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.BASAK_SMTP_HOST,
          port: Number(process.env.BASAK_SMTP_PORT),
          secure: false,
          auth: {
            user: process.env.BASAK_SMTP_USER,
            pass: process.env.BASAK_SMTP_PASS,
          },
        });
        await transporter.sendMail({
          from: process.env.BASAK_SMTP_FROM,
          to: updatedEmployee.email,
          subject: "[Basak Chicken] 직원 정보 변경 안내",
          html: `
            <div style="font-family: 'Pretendard', 'Apple SD Gothic Neo', Arial, sans-serif; background: #fffbe9; padding: 32px; border-radius: 16px; border: 1px solid #ffe6a7; max-width: 480px; margin: 0 auto;">
              <h2 style="color: #d97706; margin-bottom: 16px;">🍗 Basak Chicken 직원 정보 변경 안내</h2>
              <p style="font-size: 16px; color: #222; margin-bottom: 16px;">
                안녕하세요, <b>${updatedEmployee.name}</b>님!<br/>
                <span style="color: #d97706; font-weight: bold;">Basak Chicken</span>에서 귀하의 직원 정보가 <b>수정</b>되었습니다.
              </p>
              <div style="background: #fff; border-radius: 8px; padding: 16px; border: 1px solid #ffe6a7; margin-bottom: 16px;">
                <p style="margin: 0 0 8px 0; font-size: 15px;"><b>아이디:</b> ${updatedEmployee.employeeId}</p>
                <p style="margin: 0 0 8px 0; font-size: 15px;"><b>이름:</b> ${updatedEmployee.name}</p>
                <p style="margin: 0 0 8px 0; font-size: 15px;"><b>부서:</b> ${updatedEmployee.department}</p>
                <p style="margin: 0 0 8px 0; font-size: 15px;"><b>직책:</b> ${updatedEmployee.position}</p>
                <p style="margin: 0 0 8px 0; font-size: 15px;"><b>연락처:</b> ${updatedEmployee.phone || '-'}</p>
                <p style="margin: 0 0 8px 0; font-size: 15px;"><b>주소:</b> ${updatedEmployee.address || '-'}</p>
              </div>
              <p style="font-size: 15px; color: #444; margin-bottom: 16px;">
                변경된 정보로 로그인하실 수 있으며,<br/>
                <b>체크리스트와 메뉴얼</b>을 언제든 확인하실 수 있습니다.<br/>
                <a href="https://crew.basak-chicken.com" style="color: #fff; background: #d97706; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold;">직원 페이지 바로가기</a>
              </p>
              <p style="font-size: 13px; color: #888;">문의: 관리자에게 연락 바랍니다.</p>
              <div style="margin-top: 24px; text-align: right; color: #d97706; font-weight: bold;">Basak Chicken</div>
            </div>
          `,
        });
      } catch (mailErr) {
        console.error("직원 정보 변경 메일 전송 오류:", mailErr);
      }
    }
    // 비밀번호 제외하고 반환
    const { password, ...employeeWithoutPassword } = updatedEmployee;
    return NextResponse.json(employeeWithoutPassword, { status: 200 });
  } catch (error) {
    console.error("직원 정보 수정 오류:", error);
    return NextResponse.json(
      { error: "직원 정보 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
} 