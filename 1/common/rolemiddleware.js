// backend/middlewares/role.middleware.js

export default function requireRole(...allowedRoles) {
  // 미들웨어 정의 시 넘겨준 allowedRoles를 전부 소문자로 변환
  const normalizedAllowed = allowedRoles.map((r) => r.toLowerCase());

  return (req, res, next) => {
    // req.user.id가 없으면 _id로 설정 (authmiddleware에서 설정했지만 안전하게 다시 설정)
    if (req.user && !req.user.id && req.user._id) {
      req.user.id = req.user._id;
    }

    if (!req.user) {
      return res
        .status(403)
        .json({ success: false, message: "인증이 필요합니다." });
    }

    if (!req.user.role) {
      return res
        .status(403)
        .json({ 
          success: false, 
          message: "권한 정보가 없습니다.",
          debug: { hasUser: !!req.user, userKeys: req.user ? Object.keys(req.user) : [] }
        });
    }

    // 토큰에 들어있는 role도 소문자로 변환해서 비교
    const userRole = String(req.user.role).toLowerCase();

    if (!normalizedAllowed.includes(userRole)) {
      return res
        .status(403)
        .json({ 
          success: false, 
          message: "권한이 없습니다.",
          required: allowedRoles,
          current: req.user.role,
          debug: { normalizedAllowed, userRole }
        });
    }

    next();
  };
}
